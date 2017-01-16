import { ipcMain as ipc } from 'electron';

const KERNEL_SPECS = {};

export default function saveKernelspecs(kernelSpecs) {
  Object.assign(KERNEL_SPECS, kernelSpecs);
}

ipc.on('kernel_specs_request', (event) => {
  event.sender.send('kernel_specs_reply', KERNEL_SPECS);
});
