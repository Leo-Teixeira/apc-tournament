import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalContent,
  Button
} from "@heroui/react";
import { ButtonComponents } from "./button";

type GenericModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
};

export const GenericModal: React.FC<GenericModalProps> = ({
  isOpen,
  onClose,
  title,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
  children
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="md">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="text-primary_brand-50 font-satoshiBold text-xl">
              {title}
            </ModalHeader>
            <ModalBody className="bg-zinc-900 text-primary_brand-50 space-y-4">
              {children}
            </ModalBody>
            <ModalFooter className="bg-zinc-900 flex gap-2 justify-end">
              <ButtonComponents
                onClick={onCancel || onClose}
                buttonClassName="bg-transparent hover:bg-ligth/30"
                textClassName="text-danger-500"
                text={cancelLabel}
              />
              <ButtonComponents
                onClick={onConfirm}
                buttonClassName="bg-primary_background hover:bg-primary_hover_background"
                textClassName="text-primary_brand-50"
                text={confirmLabel}
              />
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
