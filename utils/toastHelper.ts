// utils/ toastHelper.ts
import { toast, TypeOptions, Theme, ToastOptions} from "react-toastify";

export const showAlert = (
    type: TypeOptions,
    message: string,
    autoClose: number = 3000,
    theme: Theme = "light"
) => {
    const options: ToastOptions = {
        position: 'top-center',
        autoClose: autoClose,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        progress : undefined,
        theme: theme,

    };
    switch (type){
        case 'success':
            toast.success(message, options);
            break;
        case 'error':
            toast.error(message, options);
            break;
        case 'info':
            toast.info(message, options);
            break;
        case 'warning':
            toast.warn(message, options);
            break;
        default:
            toast(message, options);
            break;
    }
}