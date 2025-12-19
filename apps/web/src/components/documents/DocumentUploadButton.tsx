"use client";

import { useState, useCallback } from "react";
import { Button } from "@aibos/ui";
import { DocumentUploadForm } from "./DocumentUploadForm";

export function DocumentUploadButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <Button onClick={handleOpen}>Upload Document</Button>
      <DocumentUploadForm isOpen={isOpen} onClose={handleClose} />
    </>
  );
}

