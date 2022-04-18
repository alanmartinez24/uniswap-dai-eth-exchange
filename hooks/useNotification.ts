import { useSnackbar } from 'notistack';

const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar()

  const notifySuccess = (message: string) => enqueueSnackbar(message, { variant: 'success' })
  const notifyError = (message: string) => enqueueSnackbar(message, { variant: 'error' })

  return {
    notifySuccess,
    notifyError
  }
}

export default useNotification
