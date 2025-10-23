// Error handling utilities for better UX

export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
}

export function parseContractError(error: any): UserFriendlyError {
  const errorMessage = error?.message || error?.toString() || '';

  // User rejected transaction
  if (
    errorMessage.includes('user rejected') ||
    errorMessage.includes('User denied') ||
    errorMessage.includes('rejected')
  ) {
    return {
      title: 'Transaction Cancelled',
      message: 'You cancelled the transaction in your wallet.',
      action: 'Try again when ready',
    };
  }

  // Insufficient balance
  if (
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('insufficient balance') ||
    errorMessage.includes('exceeds balance')
  ) {
    return {
      title: 'Insufficient USDC Balance',
      message:
        'You do not have enough USDC in your wallet to complete this transaction.',
      action: 'Get USDC on Base',
      actionUrl: 'https://www.base.org/bridge',
    };
  }

  // Approval issues
  if (
    errorMessage.includes('insufficient allowance') ||
    errorMessage.includes('ERC20: transfer amount exceeds allowance')
  ) {
    return {
      title: 'Approval Required',
      message:
        'You need to approve USDC spending before creating a pension plan.',
      action: 'Click "Approve USDC" first',
    };
  }

  // Contract-specific errors
  if (errorMessage.includes('invalid amounts')) {
    return {
      title: 'Invalid Amounts',
      message: 'Monthly amount and months must be greater than zero.',
      action: 'Check your input values',
    };
  }

  if (errorMessage.includes('invalid totalPay')) {
    return {
      title: 'Incorrect Total Amount',
      message:
        'The calculated total does not match the required deposit amount.',
      action: 'Verify your amounts',
    };
  }

  if (errorMessage.includes('below minDeposit')) {
    return {
      title: 'Deposit Too Low',
      message:
        'Your deposit is below the minimum required amount for a pension plan.',
      action: 'Increase monthly amount or duration',
    };
  }

  if (
    errorMessage.includes('duration < min') ||
    errorMessage.includes('duration > max')
  ) {
    return {
      title: 'Invalid Duration',
      message:
        'The total duration of your plan is outside the allowed range (1-10 years).',
      action: 'Adjust the duration',
    };
  }

  if (errorMessage.includes('transferFrom failed')) {
    return {
      title: 'Transfer Failed',
      message: 'Unable to transfer USDC from your wallet to the contract.',
      action: 'Check your balance and approval',
    };
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('fetch')
  ) {
    return {
      title: 'Network Error',
      message:
        'Unable to connect to the blockchain network. Please check your internet connection.',
      action: 'Try again',
    };
  }

  // Gas estimation errors
  if (
    errorMessage.includes('gas') ||
    errorMessage.includes('out of gas') ||
    errorMessage.includes('intrinsic gas too low')
  ) {
    return {
      title: 'Insufficient Gas',
      message:
        'You do not have enough ETH to pay for transaction gas fees on Base network.',
      action: 'Add ETH to your wallet',
      actionUrl: 'https://www.base.org/bridge',
    };
  }

  // Wrong network
  if (errorMessage.includes('chain') || errorMessage.includes('network')) {
    return {
      title: 'Wrong Network',
      message: 'Please switch to Base network in your wallet.',
      action: 'Switch to Base',
    };
  }

  // Generic fallback
  return {
    title: 'Transaction Failed',
    message:
      errorMessage.length > 100
        ? 'An unexpected error occurred. Please try again or contact support.'
        : errorMessage || 'An unexpected error occurred.',
    action: 'Try again',
  };
}

export function formatTransactionHash(hash: string): string {
  if (!hash) return '';
  return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
}

export function getBaseScanUrl(txHash: string): string {
  return `https://basescan.org/tx/${txHash}`;
}
