"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
}

/** Bọc toàn trang ở layout.tsx — lỗi 1 khu vực không làm trắng cả trang. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[ErrorBoundary${this.props.moduleName ? `:${this.props.moduleName}` : ""}]`, error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="mx-auto my-8 max-w-lg rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">Đã có lỗi xảy ra.</p>
          <p className="mt-1 text-sm text-red-600">
            Vui lòng tải lại trang hoặc liên hệ hotline để được hỗ trợ.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
