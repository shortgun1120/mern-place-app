import React,{ useRef, useState, useEffect } from "react";
import Button from "./Button";

import './ImageUpload.css';

const ImageUpload = props => { 

    const [file, setFile] = useState();
    const [previewUrl, setPreviewUrl] = useState();
    const [isValid, setIsValid] = useState(false);

    const filePickerRef = useRef();

    useEffect(() => {
        if(!file) {
            return;
        }
        const fileReader = new FileReader();
        fileReader.onload = () => {
            setPreviewUrl(fileReader.result);
        };
        fileReader.readAsDataURL(file);
    }, [file]);

    const pickedHandler = event => { // Fixed typo in function name
        let pickedFile;
        let fileIsValid = isValid;
        if (event.target.files && event.target.files.length === 1) { // Fixed condition
            pickedFile = event.target.files[0];
            setFile(pickedFile);
            setIsValid(true);
            fileIsValid = true;
        } else {
            setIsValid(false);
            fileIsValid = false;
        }
        props.onInput(props.id, pickedFile, fileIsValid); // Pass the correct file data
    };

    const pickImageHandler = () => {
        filePickerRef.current.click();
        // Trigger the hidden file input to open the file dialog
        // This allows users to select an image file
    };

    return (
        <div className="form-control">
            <input
                id={props.id}
                ref={filePickerRef}
                style={{ display: 'none' }}
                type="file"
                accept=".jpg,.png,.jpeg"
                onChange={pickedHandler}
            />
            <div className={`image-upload ${props.center && 'center'}`}>
                <div className="image-upload__preview">
                    {previewUrl && <img src={previewUrl} alt="Preview" />}
                    {!previewUrl && <p>Please pick an image.</p>}
                </div>
                <Button type="button" onClick={pickImageHandler}>
                    {props.buttonText || 'Upload Image'}
                </Button>
            </div>
            {!isValid && <p> {props.errorText}</p>}
        </div>
    )
};

export default ImageUpload;