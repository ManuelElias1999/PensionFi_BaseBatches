# 🧾 PensionFI Smart Contract

## Descripción General
**PensionFI** es un contrato inteligente diseñado para gestionar **planes de pensión programados con pagos automáticos** en USDC.  
Los usuarios pueden crear un plan que les permita **recibir pagos mensuales durante un periodo determinado**, mientras que el contrato se encarga de distribuir los fondos y ejecutar los pagos de manera automatizada mediante **Chainlink Automation**.

---

## 🧠 Flujo del Contrato

1. **Creación de plan (`payPension`)**
   - El usuario define:
     - Monto mensual a recibir (`monthlyAmount`)
     - Duración en meses (`months`)
     - Monto total que va a depositar (`totalAmountSend`)
   - El contrato calcula el monto real requerido aplicando un **10% adicional**.
   - Si el monto enviado no coincide con el calculado, la transacción falla.
   - El usuario transfiere el monto total al contrato, el cual reparte:
     - **95%** a la `mainWallet`
     - **5%** a la `feeWallet`
   - Se crea un nuevo **plan activo** con los parámetros definidos.

2. **Ejecución automática (`checkUpkeep` y `performUpkeep`)**
   - Chainlink Automation revisa periódicamente los planes activos.
   - Si un plan tiene un pago pendiente (según el `interval` configurado), se activa el pago.
   - El contrato transfiere el monto mensual desde la `mainWallet` al beneficiario.
   - Se reduce el contador de pagos restantes.
   - Cuando se completan todos los pagos, el plan se marca como **inactivo**.

3. **Configuraciones administrativas**
   - El propietario puede modificar:
     - `interval` (tiempo entre pagos)
     - `minDeposit` (monto mínimo permitido)
     - `mainWallet` o `owner`
   - También puede desactivar manualmente un plan.

---

## ⚙️ Variables Principales

- **`interval`** → tiempo entre pagos (por defecto configurable, ej. 5 min o 1 mes)  
- **`minDuration` / `maxDuration`** → define el rango permitido del plan  
- **`minDeposit`** → depósito mínimo requerido  
- **`mainWallet`** → recibe el 95% de los fondos  
- **`feeWallet`** → recibe el 5% de los fondos  

---

## 🧩 Eventos Clave

- `PlanCreated` → al crear un nuevo plan de pensión  
- `PaymentExecuted` → cuando se realiza un pago mensual  
- `PlanCompleted` → al finalizar todos los pagos  
- `PaymentFailed` → si un pago automático falla  
- `IntervalUpdated` y `MinDepositUpdated` → cuando el administrador cambia los parámetros  

---

## 💡 Resumen

PensionFI permite simular un **sistema de rentas mensuales tokenizadas**, en el que los fondos se depositan una sola vez y se distribuyen periódicamente de forma automatizada, garantizando transparencia, seguridad y control descentralizado.
