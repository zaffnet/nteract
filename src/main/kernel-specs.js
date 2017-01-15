export default function saveKernelspecs(kernelSpecs) {
  global.KERNEL_SPECS = kernelSpecs;
  return kernelSpecs;
}
