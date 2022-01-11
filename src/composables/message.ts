import { toast } from 'bulma-toast';

function showInfo(text: string): void {
  toast({
    message: text,
    type: 'is-info',
    duration: 5000,
    position: 'top-center',
    dismissible: true,
  });
}

function showSuccess(text: string): void {
  toast({
    message: text,
    type: 'is-success',
    duration: 5000,
    position: 'top-center',
    dismissible: true,
  });
}

function showWarning(text: string): void {
  toast({
    message: text,
    type: 'is-warning',
    duration: 5000,
    position: 'top-center',
    dismissible: true,
  });
}

function showError(error: Error): void {
  toast({
    message: error.message,
    type: 'is-danger',
    duration: 5000,
    position: 'top-center',
    dismissible: true,
  });
}

export {
  showInfo,
  showSuccess,
  showWarning,
  showError,
};
