import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { type VariantProps } from 'class-variance-authority';

import { toastVariants } from './toast';

export interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
  VariantProps<typeof toastVariants> {}

export interface ToastActionElement extends React.ReactElement<typeof ToastPrimitives.Action> {} 