import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
} from 'lucide-react';

// Toast utility functions with custom styling
export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: <CheckCircle2 size={18} className="text-emerald-400" />,
      style: {
        background: '#1a1a2e',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        color: '#fff',
      },
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: <XCircle size={18} className="text-red-400" />,
      style: {
        background: '#1a1a2e',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        color: '#fff',
      },
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: <AlertCircle size={18} className="text-yellow-400" />,
      style: {
        background: '#1a1a2e',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        color: '#fff',
      },
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: <Info size={18} className="text-blue-400" />,
      style: {
        background: '#1a1a2e',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        color: '#fff',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      icon: <Loader2 size={18} className="text-brand-400 animate-spin" />,
      style: {
        background: '#1a1a2e',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        color: '#fff',
      },
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },
};

// Custom toast with action
export const showActionToast = (
  message: string,
  action: {
    label: string;
    onClick: () => void;
  }
) => {
  toast(message, {
    action: {
      label: action.label,
      onClick: action.onClick,
    },
    style: {
      background: '#1a1a2e',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      color: '#fff',
    },
  });
};

// Connection status toast
export const showConnectionToast = (status: 'connected' | 'disconnected' | 'reconnecting') => {
  switch (status) {
    case 'connected':
      showToast.success('Connected', 'You are now online');
      break;
    case 'disconnected':
      showToast.error('Disconnected', 'Check your internet connection');
      break;
    case 'reconnecting':
      showToast.warning('Reconnecting...', 'Attempting to restore connection');
      break;
  }
};
