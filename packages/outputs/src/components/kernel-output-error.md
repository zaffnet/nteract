The `<KernelOutputError />` component will render a Jupyter error with or without a traceback.

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
<KernelOutputError ename="NameError" evalue="Yikes!" traceback={["Yikes, never heard of that one!"]} />
```

You can also just render the `ename` and `evalue` for a more simplified view of error messages.

```jsx
<KernelOutputError ename="NameError" evalue="Yikes!" />
```