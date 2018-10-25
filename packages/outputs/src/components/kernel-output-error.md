The `<KernelOutputError />` component will render a Jupyter error, with primacy towards
`traceback` and falling back on `ename` + `evalue` (old error style that is still sent by kernels). Tracebacks usually include the `ename` and `evalue` at the bottom.

Per the Jupyter Messaging Protocol, the kernel will return the following payload if it encountered an error during the execution of a code cell.

```json
{
   'status' : 'error',
   'ename' : string,
   'evalue' : string,
   'traceback' : string[],
}
```

The `ename` property contains the name of the error (`OutOfMemory` or `NameError`). The `evalue` property contains the value of the error. This is usually the first line you see before the complete tracebook. The `traceback` property contains the stacktrace of the error as a list of strings, which each string consisting of a line within the stacktrace.

We provide a special `KernelOutputError` component that will allow you to render the error payloads received from the kernel. You can pass the `ename,` `evalue`, and `tracebook` property values to render the error and tracebook in a clean format.

```jsx
const errorMessage = {
  output_type: "error",
  ename: "NameError",
  evalue: "name 'asdfaljsd' is not defined",
  traceback: [
    "\u001b[0;31m---------------------------------------------------------------------------\u001b[0m",
    "\u001b[0;31mNameError\u001b[0m                                 Traceback (most recent call last)",
    "\u001b[0;32m<ipython-input-2-e818d3730d2b>\u001b[0m in \u001b[0;36m<module>\u001b[0;34m()\u001b[0m\n\u001b[0;32m----> 1\u001b[0;31m \u001b[0masdfaljsd\u001b[0m\u001b[0;34m\u001b[0m\u001b[0m\n\u001b[0m",
    "\u001b[0;31mNameError\u001b[0m: name 'asdfaljsd' is not defined"
  ]
};

<KernelOutputError
  ename={errorMessage.ename}
  evalue={errorMessage.evalue}
  traceback={errorMessage.traceback}
/>;
```

With no traceback, the `ename` and `evalue` is used. This is common in older versions of this output type.

```jsx
<KernelOutputError ename="NameError" evalue="Yikes!" />
```
