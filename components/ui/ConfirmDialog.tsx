import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

export type Confirmation = {
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "danger" | "primary";
  action: () => void;
};

type Props = {
  confirmation: Confirmation | null;
  onClose: () => void;
};

export function ConfirmDialog({ confirmation, onClose }: Props) {
  // Keep the last confirmation so the content stays visible while the
  // closing transition plays after it is set to null.
  const lastConfirmation = useRef<Confirmation | null>(null);
  if (confirmation) {
    lastConfirmation.current = confirmation;
  }
  const shown = confirmation ?? lastConfirmation.current;
  const isDanger = (shown?.variant ?? "danger") === "danger";

  const handleConfirm = () => {
    onClose();
    shown?.action();
  };

  return (
    <Transition.Root show={confirmation !== null} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div
                    className={cn(
                      "mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10",
                      isDanger ? "bg-red-100" : "bg-gray-100",
                    )}
                  >
                    <ExclamationTriangleIcon
                      aria-hidden="true"
                      className={cn(
                        "h-6 w-6",
                        isDanger ? "text-red-600" : "text-gray-600",
                      )}
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold text-gray-900"
                    >
                      {shown?.title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {shown?.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    data-testid="confirm-dialog-confirm"
                    className={cn(
                      "inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto cursor-pointer",
                      isDanger
                        ? "bg-red-600 hover:bg-red-500"
                        : "bg-gray-900 hover:bg-gray-800",
                    )}
                  >
                    {shown?.confirmLabel}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    data-testid="confirm-dialog-cancel"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
