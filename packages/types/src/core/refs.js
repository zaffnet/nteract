// @flow
import { v4 as uuid } from "uuid";

export opaque type HostRef = string;
export opaque type KernelRef = string;
export opaque type KernelspecsRef = string;

export const createHostRef = (): HostRef => uuid();
export const createKernelRef = (): KernelRef => uuid();
export const createKernelspecsRef = (): KernelspecsRef => uuid();
