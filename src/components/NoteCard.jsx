import { useEffect, useRef, useState, useContext } from "react";
import DeleteButton from "./DeleteButton";
import { setNewOffset, autoGrow, setZIndex, bodyParser } from '../utils.js'
import { db } from "../appwrite/databases";
import Spinner from "../icons/Spinner";
import { NoteContext } from "../context/NoteContext";

const NoteCard = ({ note, setNotes }) => {
    const { setSelectedNote } = useContext(NoteContext);
    
    let mouseStartPos = { x: 0, y: 0 };

    const cardRef = useRef(null);

    const mouseMove = (e) => {
        let mouseMoveDir = {
            x: mouseStartPos.x - e.clientX,
            y: mouseStartPos.y - e.clientY,
        };
     
        mouseStartPos.x = e.clientX;
        mouseStartPos.y = e.clientY;
     
        const newPosition = setNewOffset(cardRef.current, mouseMoveDir);
        setPosition(newPosition);
    };

    const mouseUp = () => {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);
 
        const newPosition = setNewOffset(cardRef.current); //{x,y}
        saveData("position", newPosition);
    };

    const mouseDown = (e) => {
        if (e.target.className === "card-header") {
            setZIndex(cardRef.current);
            mouseStartPos.x = e.clientX;
            mouseStartPos.y = e.clientY;
        
            document.addEventListener("mousemove", mouseMove);
            document.addEventListener("mouseup", mouseUp);

            setSelectedNote(note);
        }
    };

    const [position, setPosition] = useState(JSON.parse(note.position));
    const colors = JSON.parse(note.colors);
    const body = bodyParser(note.body);

    const textAreaRef = useRef(null);

    useEffect(() => {
        autoGrow(textAreaRef);
        setZIndex(cardRef.current);
    }, []);

    const saveData = async (key, value) => {
        const payload = { [key]: JSON.stringify(value) };
        try {
            await db.notes.update(note.$id, payload);
        } catch (error) {
            console.error(error);
        }
        setSaving(false);
    };

    const [saving, setSaving] = useState(false);

    const keyUpTimer = useRef(null);

    const handleKeyUp = async () => {
        //1 - Initiate "saving" state
        setSaving(true);
     
        //2 - If we have a timer id, clear it so we can add another two seconds
        if (keyUpTimer.current) {
            clearTimeout(keyUpTimer.current);
        }
     
        //3 - Set timer to trigger save in 2 seconds
        keyUpTimer.current = setTimeout(() => {
            saveData("body", textAreaRef.current.value);
        }, 2000);
    };
 
    return (
        <div className="card" ref={cardRef} style={{ backgroundColor: colors.colorBody, left: `${position.x}px`, top: `${position.y}px` }}>
            <div className="card-header" onMouseDown={ mouseDown } style={{ backgroundColor: colors.colorHeader }}>
                <DeleteButton noteId={note.$id} setNotes={setNotes} />

                {saving && (
                    <div className="card-saving">
                        <Spinner color={colors.colorText} />
                        <span style={{ color: colors.colorText }}>
                            Saving...
                        </span>
                    </div>
                )}
            </div>

            <div className='card-body'>
                <textarea ref={textAreaRef} onKeyUp={handleKeyUp} onFocus={() => { setZIndex(cardRef.current); setSelectedNote(note); }} defaultValue={body} style={{ backgroundColor: colors.colorText }} onInput={() => autoGrow(textAreaRef)}></textarea>
            </div>
        </div>
    );
}

export default NoteCard;