import { toast } from "react-toastify";

export const notify = (status, message) => {
  switch (status) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warning':
      toast.warn(message);
      break;
    default:
      toast.info(message);
  }
};