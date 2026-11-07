"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./create-post-modal.module.css";

const recipients = [
  { name: "Mateo", initial: "M", color: "mateo" },
  { name: "Sofía", initial: "S", color: "sofia" },
  { name: "Benjamín", initial: "B", color: "benjamin" },
] as const;

const categories = [
  { name: "Comida", color: "food" },
  { name: "Siesta", color: "nap" },
  { name: "Actividad", color: "activity" },
  { name: "Logro", color: "achievement" },
  { name: "Ánimo", color: "mood" },
  { name: "Foto", color: "photo" },
  { name: "Anuncio", color: "announcement" },
] as const;

export type PostCategory = (typeof categories)[number]["name"];

export type CreatePostSubmission = {
  recipients: string[];
  category: PostCategory;
  description: string;
  photos: string[];
};

type SelectedPhoto = {
  id: string;
  name: string;
  url: string;
};

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (submission: CreatePostSubmission) => void;
};

export default function CreatePostModal({
  isOpen,
  onClose,
  onPublish,
}: CreatePostModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoUrlsRef = useRef<string[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(["Mateo"]);
  const [wholeRoom, setWholeRoom] = useState(false);
  const [category, setCategory] = useState<PostCategory>("Comida");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const recipientError = showErrors && !wholeRoom && selectedRecipients.length === 0;
  const descriptionError = showErrors && description.trim().length === 0;

  useEffect(() => {
    if (!isOpen) return;

    setSelectedRecipients(["Mateo"]);
    setWholeRoom(false);
    setCategory("Comida");
    setDescription("");
    setPhotos([]);
    setShowErrors(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();

    return () => {
      if (dialog?.open) dialog.close();
      photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      photoUrlsRef.current = [];
    };
  }, [isOpen]);

  function toggleRecipient(name: string) {
    setWholeRoom(false);
    setSelectedRecipients((current) =>
      current.includes(name)
        ? current.filter((recipient) => recipient !== name)
        : [...current, name],
    );
  }

  function toggleWholeRoom() {
    setWholeRoom((current) => !current);
    setSelectedRecipients([]);
  }

  function handleClose() {
    photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    photoUrlsRef.current = [];
    setSelectedRecipients(["Mateo"]);
    setWholeRoom(false);
    setCategory("Comida");
    setDescription("");
    setPhotos([]);
    setShowErrors(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;

    const newPhotos = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        url: URL.createObjectURL(file),
      }));

    photoUrlsRef.current.push(...newPhotos.map((photo) => photo.url));
    setPhotos((current) => [...current, ...newPhotos]);
  }

  function removePhoto(photoToRemove: SelectedPhoto) {
    URL.revokeObjectURL(photoToRemove.url);
    photoUrlsRef.current = photoUrlsRef.current.filter(
      (url) => url !== photoToRemove.url,
    );
    setPhotos((current) => current.filter((photo) => photo.id !== photoToRemove.id));
  }

  function handlePublish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowErrors(true);

    if ((!wholeRoom && selectedRecipients.length === 0) || !description.trim()) return;

    const photoUrls = photos.map((photo) => photo.url);
    // A successful submission transfers the temporary URLs to the Feed.
    photoUrlsRef.current = [];
    onPublish({
      recipients: wholeRoom ? ["Toda la sala"] : selectedRecipients,
      category,
      description: description.trim(),
      photos: photoUrls,
    });
  }

  function handleDialogClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) handleClose();
  }

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="create-post-title"
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClick={handleDialogClick}
    >
      <form className={styles.form} onSubmit={handlePublish} noValidate>
        <header className={styles.header}>
          <button className={styles.cancelButton} type="button" onClick={handleClose}>
            Cancelar
          </button>
          <h2 id="create-post-title" className={styles.title}>
            Nueva publicación
          </h2>
          <button className={styles.publishButton} type="submit">
            Publicar
          </button>
          <button
            className={styles.closeButton}
            type="button"
            aria-label="Cerrar nueva publicación"
            onClick={handleClose}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className={styles.body}>
          <section className={styles.section} aria-labelledby="recipients-label">
            <h3 id="recipients-label" className={styles.sectionLabel}>
              PARA
            </h3>
            <div
              className={styles.choiceList}
              role="group"
              aria-labelledby="recipients-label"
              aria-describedby={recipientError ? "recipient-error" : undefined}
            >
              {recipients.map((recipient) => {
                const isSelected = selectedRecipients.includes(recipient.name);
                return (
                  <button
                    key={recipient.name}
                    className={`${styles.recipientChip} ${isSelected ? styles.selectedRecipient : ""}`}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleRecipient(recipient.name)}
                  >
                    <span className={`${styles.recipientAvatar} ${styles[recipient.color]}`}>
                      {recipient.initial}
                    </span>
                    {recipient.name}
                  </button>
                );
              })}
              <button
                className={`${styles.recipientChip} ${styles.roomChip} ${wholeRoom ? styles.selectedRecipient : ""}`}
                type="button"
                aria-pressed={wholeRoom}
                onClick={toggleWholeRoom}
              >
                Toda la sala
              </button>
            </div>
            {recipientError && (
              <p className={styles.errorMessage} id="recipient-error" role="alert">
                Elegí al menos un destinatario.
              </p>
            )}
          </section>

          <section className={styles.section} aria-labelledby="category-label">
            <h3 id="category-label" className={styles.sectionLabel}>
              TIPO
            </h3>
            <div className={styles.choiceList} role="group" aria-labelledby="category-label">
              {categories.map((option) => {
                const isSelected = category === option.name;
                return (
                  <button
                    key={option.name}
                    className={`${styles.categoryChip} ${styles[option.color]} ${isSelected ? styles.selectedCategory : ""}`}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setCategory(option.name)}
                  >
                    {option.name}
                  </button>
                );
              })}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="description-label">
            <label id="description-label" className={styles.sectionLabel} htmlFor="post-description">
              DESCRIPCIÓN
            </label>
            <textarea
              id="post-description"
              className={`${styles.description} ${descriptionError ? styles.invalidField : ""}`}
              placeholder="Contá cómo le fue hoy…"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              aria-invalid={descriptionError}
              aria-describedby={descriptionError ? "description-error" : undefined}
            />
            {descriptionError && (
              <p className={styles.errorMessage} id="description-error" role="alert">
                Escribí una descripción antes de publicar.
              </p>
            )}
          </section>

          <section className={styles.section} aria-labelledby="photos-label">
            <h3 id="photos-label" className={styles.sectionLabel}>
              FOTOS
            </h3>
            <div className={styles.photoList}>
              {photos.map((photo) => (
                <div className={styles.photoPreview} key={photo.id}>
                  {/* Local object URLs are intentionally used only for this in-memory draft. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={photo.name} />
                  <button
                    className={styles.removePhotoButton}
                    type="button"
                    aria-label={`Quitar ${photo.name}`}
                    onClick={() => removePhoto(photo)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m6 6 12 12M18 6 6 18" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                className={styles.addPhotoButton}
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>Agregar</span>
              </button>
              <input
                ref={fileInputRef}
                className={styles.fileInput}
                type="file"
                accept="image/*"
                multiple
                aria-label="Adjuntar fotos"
                onChange={(event) => {
                  addPhotos(event.currentTarget.files);
                  event.currentTarget.value = "";
                }}
              />
            </div>
          </section>
        </div>
      </form>
    </dialog>
  );
}
