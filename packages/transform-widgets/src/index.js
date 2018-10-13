/* @flow */
import type {
  ContentRef,
  AppState,
  KernelRecord,
  RemoteKernelProps,
  LocalKernelProps
} from "@nteract/core";

import React from "react";
// import { OuterShim } from "./outer-shim";
import { actions, selectors } from "@nteract/core";
import { connect } from "react-redux";


type Props = {
  data: { model_id: string },
  currentKernel: LocalKernelProps | RemoteKernelProps
};

/**
 * Component used to render a widget view.
 * 
 * Given a kernel and widget model id, this component will render a widget
 * view for the widget model. The widget view and widget models are isolated to
 * a cross domain iframe. Since they have access to the kernel, they are capable
 * of communicating directly with the kernel instance which makes them atypical.
 * 
 * Even though it may appear to be pure, since it doesn't have react state, this
 * component's iframe maintains it's own state in communication with the kernel.
 */
export class PureWidgetDisplay extends React.Component<Props, null> {
  static MIMETYPE = "application/vnd.jupyter.widget-view+json";

  // TODO: Uncomment this and related code in a follow-up PR.
  // The outer shim is responsable for managing the rendered cross domain
  // iframe, communicating with it, and relaying information to and from the 
  // kernel.
  // shim: OuterShim;

  // A reference to the div which we can inject the cross domain widget iframe.
  container: { current: null | HTMLDivElement } = React.createRef();

  /** @override */
  componentDidMount() {
    if (!this.container.current) return;

    // When the component has mounted, inject the widget iframe.
    // const view = this.shim.getView();
    // this.container.current.appendChild(view);
  }

  /** @override */
  componentWillUnmount() {
    // if (this.shim) {
    //   this.shim.dispose();
    //   delete this.shim;
    // }
  }

  /** @override */
  shouldComponentUpdate(nextProps: Props): boolean {
    // Only update if the model_id or kernel_id have changed.
    if (nextProps.data.model_id !== this.props.data.model_id) {
      return true;
    }

    // If this is a local kernel, the kernel id will not be defined and we do
    // not have to worry about it changing.
    if (!(nextProps.currentKernel.id && this.props.currentKernel.id)) {
      return false;
    }

    // If the kernel id has changed, we need to make sure that we connect the
    // shim to the new kernel.
    if (nextProps.currentKernel.id !== this.props.currentKernel.id) {
      return true;
    }

    return false;
  }

  /** @override */
  render(): ?React$Element<any> {
    this.createOrUpdateShim();

    return (<pre>
      Jupyter-Widgets are not yet supported in nteract.
      <div ref={this.container} /></pre>);
  }

  /** 
   * Creates or updates the existing shim to the current model id and kernel.
   */
  createOrUpdateShim() {
    // if (!this.shim) {
    //   this.shim = new OuterShim();
    // }

    // this.shim.setCommMsgsSubject(this.props.currentKernel.channels);
    // this.shim.setModelId(this.props.data.model_id);
  }
}

// Connect the PureWidgetDisplay component to the current kernel. The resultant
// component only require display data to render (the widget model id).
const mapStateToProps = (
    state: AppState, { contentRef }: { contentRef: ContentRef }) => 
        ({currentKernel: selectors.currentKernel(state)});
const mapDispatchersToProps = () => ({});
export const WidgetDisplay = 
    connect(mapStateToProps, mapDispatchersToProps)(PureWidgetDisplay);
