// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Smart Contract Deployed in Base Mainnet 
// https://basescan.org/address/0x4Fa29a8c7D5CA5Ac1882Fd95D7Be2aae0d578e5a#code

/// --- Interfaz estándar ERC20 ---
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// --- Interfaz mínima de Chainlink Automation ---
interface AutomationCompatibleInterface {
    function checkUpkeep(bytes calldata checkData) external returns (bool upkeepNeeded, bytes memory performData);
    function performUpkeep(bytes calldata performData) external;
}

/// --- Contrato principal de pensiones descentralizadas ---
contract PensionFI is AutomationCompatibleInterface {
    IERC20 public immutable usdc;     // Token USDC utilizado para depósitos y pagos
    address public immutable feeWallet; // Dirección que recibe las comisiones del 5%
    address public owner;             // Dueño del contrato (control administrativo)
    address public mainWallet;        // Wallet principal desde la cual se envían los pagos

    uint256 public nextPlanId;        // ID incremental para los planes
    uint256 public lastCheckedIndex;  // Último índice revisado en Chainlink Automation
    uint256 public interval;          // Intervalo de tiempo entre pagos (ej. 5min testnet, 30d mainnet)
    uint256 public minDuration;       // Duración mínima total del plan
    uint256 public maxDuration;       // Duración máxima total del plan
    uint256 public minDeposit;        // Monto mínimo de depósito permitido

    /// Estructura que representa un plan de pensión individual
    struct Plan {
        address beneficiary;          // Usuario beneficiario del plan
        uint256 paymentAmount;        // Monto que recibirá cada ciclo
        uint256 paymentsRemaining;    // Pagos restantes
        uint256 lastPaid;             // Último pago ejecutado
        bool active;                  // Estado del plan
    }

    mapping(uint256 => Plan) public plans;   // Mapeo de planId → Plan
    uint256[] public planIds;                // Lista de IDs activos

    /// --- Eventos para trazabilidad ---
    event PlanCreated(uint256 indexed planId, address indexed beneficiary, uint256 totalDeposited, uint256 paymentAmount, uint256 payments);
    event PaymentExecuted(uint256 indexed planId, address indexed beneficiary, uint256 amount, uint256 paymentsRemaining);
    event PlanCompleted(uint256 indexed planId);
    event PaymentFailed(uint256 indexed planId, string reason);
    event IntervalUpdated(uint256 newInterval);
    event MinDepositUpdated(uint256 newMinDeposit);

    /// --- Modificador: solo el propietario puede ejecutar ---
    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    /// --- Constructor: inicializa parámetros base del contrato ---
    constructor(
        address _usdc,
        address _mainWallet,
        address _feeWallet,
        uint256 _interval,
        uint256 _minDuration,
        uint256 _maxDuration,
        uint256 _minDeposit
    ) {
        require(_usdc != address(0) && _mainWallet != address(0) && _feeWallet != address(0), "zero addr");
        usdc = IERC20(_usdc);
        mainWallet = _mainWallet;
        feeWallet = _feeWallet;
        owner = msg.sender;
        nextPlanId = 1;
        interval = _interval;
        minDuration = _minDuration;
        maxDuration = _maxDuration;
        minDeposit = _minDeposit;
    }

    // ------------------------------------------------------------
    // FUNCIÓN PRINCIPAL: Creación de un nuevo plan de pensión
    // ------------------------------------------------------------
    /// @notice El usuario paga un monto total para financiar su plan.
    /// @param monthlyAmount Monto a recibir mensualmente
    /// @param months Número total de meses del plan
    /// @param totalAmountSend Monto total que el usuario transfiere
    ///
    /// - Aplica un 10% adicional sobre el total a recibir.
    /// - Divide los fondos: 95% → mainWallet, 5% → feeWallet.
    /// - Valida los límites de duración y depósito mínimo.
    /// - Crea un nuevo plan de pagos recurrentes.
    function payPension(
        uint256 monthlyAmount,
        uint256 months,
        uint256 totalAmountSend
    ) external {
        require(monthlyAmount > 0 && months > 0, "invalid amounts");

        uint256 totalToReceive = monthlyAmount * months;
        uint256 totalAmount = (totalToReceive * 100) / 110; // Aplica 10% adicional

        // Truncar a 2 decimales sin redondear
        totalAmount = (totalAmount / 100) * 100;

        require(totalAmountSend == totalAmount, "invalid totalPay");
        require(totalAmountSend >= minDeposit, "below minDeposit");

        uint256 totalDuration = months * interval;
        require(totalDuration >= minDuration, "duration < min");
        require(totalDuration <= maxDuration, "duration > max");

        // Transferencia desde el usuario al contrato
        bool ok = usdc.transferFrom(msg.sender, address(this), totalAmountSend);
        require(ok, "transferFrom failed");

        // División 95/5 entre mainWallet y feeWallet
        uint256 mainShare = (totalAmountSend * 95) / 100;
        uint256 feeShare = totalAmountSend - mainShare;

        require(usdc.transfer(mainWallet, mainShare), "transfer to mainWallet failed");
        require(usdc.transfer(feeWallet, feeShare), "transfer to feeWallet failed");

        // Registro del nuevo plan
        uint256 planId = nextPlanId++;
        plans[planId] = Plan({
            beneficiary: msg.sender,
            paymentAmount: monthlyAmount,
            paymentsRemaining: months,
            lastPaid: block.timestamp,
            active: true
        });

        planIds.push(planId);
        emit PlanCreated(planId, msg.sender, totalAmountSend, monthlyAmount, months);
    }

    // ------------------------------------------------------------
    // CHAINLINK AUTOMATION: Revisión de pagos pendientes
    // ------------------------------------------------------------
    /// @notice Verifica si algún plan tiene un pago vencido.
    /// @dev Retorna true y el planId a ejecutar si encuentra uno.
    function checkUpkeep(bytes calldata) external override returns (bool upkeepNeeded, bytes memory performData) {
        uint256 len = planIds.length;
        if (len == 0) return (false, bytes(""));

        for (uint256 i = 0; i < len; i++) {
            uint256 idx = (lastCheckedIndex + i) % len;
            uint256 planId = planIds[idx];
            Plan storage p = plans[planId];

            if (!p.active || p.paymentsRemaining == 0) continue;
            if (block.timestamp >= p.lastPaid + interval) {
                upkeepNeeded = true;
                performData = abi.encode(planId);
                lastCheckedIndex = (idx + 1) % len;
                return (upkeepNeeded, performData);
            }
        }
        return (false, bytes(""));
    }

    // ------------------------------------------------------------
    // CHAINLINK AUTOMATION: Ejecución del pago recurrente
    // ------------------------------------------------------------
    /// @notice Envía el pago mensual desde mainWallet al beneficiario.
    /// @dev Solo se ejecuta si el tiempo entre pagos se ha cumplido.
    function performUpkeep(bytes calldata performData) external override {
        require(performData.length == 32, "bad performData");
        uint256 planId = abi.decode(performData, (uint256));
        Plan storage p = plans[planId];
        require(p.active, "plan not active");
        require(p.paymentsRemaining > 0, "no payments left");
        require(block.timestamp >= p.lastPaid + interval, "not due yet");

        // Transfiere desde la mainWallet al beneficiario
        bool success = usdc.transferFrom(mainWallet, p.beneficiary, p.paymentAmount);
        if (!success) {
            emit PaymentFailed(planId, "transferFrom mainWallet failed");
            return;
        }

        p.paymentsRemaining -= 1;
        p.lastPaid += interval;

        emit PaymentExecuted(planId, p.beneficiary, p.paymentAmount, p.paymentsRemaining);

        if (p.paymentsRemaining == 0) {
            p.active = false;
            emit PlanCompleted(planId);
        }
    }

    // ------------------------------------------------------------
    // FUNCIONES DE CONSULTA (VIEW)
    // ------------------------------------------------------------
    /// @notice Devuelve todos los IDs de planes existentes.
    function getPlanIds() external view returns (uint256[] memory) {
        return planIds;
    }

    /// @notice Obtiene los datos completos de un plan específico.
    /// @param planId Identificador del plan a consultar.
    function getPlan(uint256 planId) external view returns (
        address beneficiary,
        uint256 paymentAmount,
        uint256 paymentsRemaining,
        uint256 lastPaid,
        bool active
    ) {
        Plan storage p = plans[planId];
        beneficiary = p.beneficiary;
        paymentAmount = p.paymentAmount;
        paymentsRemaining = p.paymentsRemaining;
        lastPaid = p.lastPaid;
        active = p.active;
    }

    // ------------------------------------------------------------
    // FUNCIONES ADMINISTRATIVAS (solo owner)
    // ------------------------------------------------------------
    /// @notice Cambia el propietario del contrato.
    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero addr");
        owner = newOwner;
    }

    /// @notice Actualiza la dirección de la wallet principal (mainWallet).
    function setMainWallet(address newMainWallet) external onlyOwner {
        require(newMainWallet != address(0), "zero addr");
        mainWallet = newMainWallet;
    }

    /// @notice Actualiza el intervalo de pagos (en segundos).
    function setInterval(uint256 newInterval) external onlyOwner {
        require(newInterval > 0, "invalid");
        interval = newInterval;
        emit IntervalUpdated(newInterval);
    }

    /// @notice Define un nuevo monto mínimo de depósito.
    function setMinDeposit(uint256 newMinDeposit) external onlyOwner {
        require(newMinDeposit > 0, "invalid");
        minDeposit = newMinDeposit;
        emit MinDepositUpdated(newMinDeposit);
    }

    /// @notice Desactiva manualmente un plan (por el owner).
    function deactivatePlan(uint256 planId) external onlyOwner {
        plans[planId].active = false;
    }
}
