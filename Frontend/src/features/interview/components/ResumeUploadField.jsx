import { useEffect, useId, useMemo, useRef, useState } from "react";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function formatFileSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isPdfFile(file) {
    return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export default function ResumeUploadField({ value, onChange, disabled = false }) {
    const inputId = useId();
    const inputRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [isDragActive, setIsDragActive] = useState(false);
    const previewUrl = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const openFilePicker = () => {
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    const resetInput = () => {
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const validateFile = (file) => {
        if (!file) {
            return "Please choose a PDF resume to continue.";
        }

        if (!isPdfFile(file)) {
            return "Only PDF resumes are supported.";
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return "Resume must be 5MB or smaller.";
        }

        return "";
    };

    const handleFileSelect = (file) => {
        const validationMessage = validateFile(file);

        if (validationMessage) {
            setErrorMessage(validationMessage);
            resetInput();
            return;
        }

        setErrorMessage("");
        onChange(file);
    };

    const handleInputChange = (event) => {
        handleFileSelect(event.target.files?.[0] ?? null);
    };

    const handleDragOver = (event) => {
        event.preventDefault();

        if (!disabled) {
            setIsDragActive(true);
        }
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragActive(false);

        if (disabled) {
            return;
        }

        handleFileSelect(event.dataTransfer.files?.[0] ?? null);
    };

    const handleRemove = () => {
        setErrorMessage("");
        resetInput();
        onChange(null);
    };

    return (
        <div className="resume-upload">
            <div className="resume-upload__header">
                <label className="section-label" htmlFor={inputId}>
                    Upload Resume
                    <span className="badge badge--best">Best Results</span>
                </label>
                {value && (
                    <button
                        type="button"
                        className="resume-upload__remove-link"
                        onClick={handleRemove}
                        disabled={disabled}
                    >
                        Remove
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                hidden
                id={inputId}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleInputChange}
                disabled={disabled}
            />

            {!value ? (
                <label
                    className={`dropzone${isDragActive ? " dropzone--active" : ""}${disabled ? " dropzone--disabled" : ""}`}
                    htmlFor={inputId}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <span className="dropzone__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                    </span>
                    <p className="dropzone__title">Click to upload or drag &amp; drop</p>
                    <p className="dropzone__subtitle">PDF only (Max 5MB)</p>
                </label>
            ) : (
                <div className="resume-preview">
                    <div className="resume-preview__meta">
                        <div className="resume-preview__details">
                            <p className="resume-preview__name">{value.name}</p>
                            <p className="resume-preview__size">{formatFileSize(value.size)}</p>
                        </div>
                        <div className="resume-preview__actions">
                            <button
                                type="button"
                                className="resume-preview__button"
                                onClick={openFilePicker}
                                disabled={disabled}
                            >
                                Replace
                            </button>
                            <button
                                type="button"
                                className="resume-preview__button resume-preview__button--ghost"
                                onClick={handleRemove}
                                disabled={disabled}
                            >
                                Remove
                            </button>
                        </div>
                    </div>

                    <div className="resume-preview__viewer">
                        {previewUrl ? (
                            <iframe
                                src={previewUrl}
                                title={`Preview of ${value.name}`}
                                className="resume-preview__frame"
                            />
                        ) : (
                            <p className="resume-preview__loading">Preparing PDF preview...</p>
                        )}
                    </div>
                </div>
            )}

            {errorMessage && <p className="resume-upload__error">{errorMessage}</p>}
        </div>
    );
}
