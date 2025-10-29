"use client"

import { useState, useEffect, useRef } from "react"
import { Trash2, FileText, Sparkles, Save, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Cross2Icon } from "@radix-ui/react-icons"

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  savedAt?: string
  isMinted?: boolean
  font?: string
}

interface DraftNote {
  content: string
  lastSaved: string
  font?: string
}

const FONT_OPTIONS = [
  { name: "Inter", value: "Inter, sans-serif", preview: "Inter" },
  { name: "Roboto Mono", value: "'Roboto Mono', monospace", preview: "Roboto Mono" },
  { name: "Pacifico", value: "Pacifico, cursive", preview: "Pacifico" },
  { name: "Poppins", value: "Poppins, sans-serif", preview: "Poppins" },
  { name: "Indie Flower", value: "'Indie Flower', cursive", preview: "Indie Flower" },
]

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [draftNote, setDraftNote] = useState<DraftNote>({ content: "", lastSaved: "", font: "Inter, sans-serif" })
  const [isCanvasMode, setIsCanvasMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasContent, setCanvasContent] = useState("")
  const [walletAddress, setWalletAddress] = useState("0x...")
  const [selectedFont, setSelectedFont] = useState("Inter, sans-serif")
  const [showFontMenu, setShowFontMenu] = useState(false)

  useEffect(() => {
    const savedNotes = localStorage.getItem("basenote-notes")
    const savedDraft = localStorage.getItem("basenote-draft")
    const savedFont = localStorage.getItem("basenote-font")

    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch (e) {
        console.error("Failed to load notes")
      }
    }

    if (savedDraft) {
      try {
        setDraftNote(JSON.parse(savedDraft))
      } catch (e) {
        console.error("Failed to load draft")
      }
    }

    if (savedFont) {
      setSelectedFont(savedFont)
    }
  }, [])

  useEffect(() => {
    if (canvasContent) {
      const updatedDraft = {
        content: canvasContent,
        lastSaved: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        font: selectedFont,
      }
      setDraftNote(updatedDraft)
      localStorage.setItem("basenote-draft", JSON.stringify(updatedDraft))
    }
  }, [canvasContent, selectedFont])

  useEffect(() => {
    localStorage.setItem("basenote-notes", JSON.stringify(notes))
  }, [notes])

  const handleFontChange = (fontValue: string) => {
    setSelectedFont(fontValue)
    localStorage.setItem("basenote-font", fontValue)
    setShowFontMenu(false)
  }

  const handleSaveNote = () => {
    if (canvasContent.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: `Note - ${new Date().toLocaleDateString()}`,
        content: canvasContent,
        createdAt: new Date().toLocaleDateString(),
        savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        font: selectedFont,
      }
      setNotes([newNote, ...notes])
      setCanvasContent("")
      setDraftNote({ content: "", lastSaved: "", font: selectedFont })
      localStorage.removeItem("basenote-draft")
      setIsCanvasMode(false)
    }
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const handleMintNFT = (note: Note) => {
    const nftMetadata = {
      name: `BaseNote - ${note.createdAt}`,
      description: `Created on ${note.createdAt} via BaseNote`,
      attributes: [
        { trait_type: "Creator", value: walletAddress },
        { trait_type: "Date", value: note.createdAt },
        { trait_type: "Content Length", value: note.content.length.toString() },
        { trait_type: "Font", value: note.font || "Inter" },
      ],
      image: "/canvas-bg.png",
      content: note.content,
    }

    console.log("NFT Metadata:", nftMetadata)
    alert(`NFT minted successfully!\n\nMetadata:\n${JSON.stringify(nftMetadata, null, 2)}`)

    setNotes(notes.map((n) => (n.id === note.id ? { ...n, isMinted: true } : n)))
  }

  return (
    <div className="space-y-6">
      {/* Canvas Editor Mode */}
      {isCanvasMode ? (
        <Card className="p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Create Note on Canvas</h2>
            <button
              onClick={() => {
                setIsCanvasMode(false)
                setCanvasContent("")
              }}
              className="p-1 hover:bg-muted rounded transition-all duration-200"
            >
              <Cross2Icon className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4 relative">
            <button
              onClick={() => setShowFontMenu(!showFontMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-background hover:bg-muted transition-all duration-200"
            >
              <Type className="w-4 h-4" />
              <span className="text-sm font-medium">
                {FONT_OPTIONS.find((f) => f.value === selectedFont)?.name || "Select Font"}
              </span>
            </button>

            {showFontMenu && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-input rounded-lg shadow-lg z-50 overflow-hidden">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => handleFontChange(font.value)}
                    className={`w-full px-4 py-3 text-left hover:bg-muted transition-all duration-200 flex items-center justify-between ${
                      selectedFont === font.value ? "bg-[#0052FF]/10 border-l-2 border-[#0052FF]" : ""
                    }`}
                  >
                    <span style={{ fontFamily: font.value }} className="text-sm font-medium">
                      {font.preview}
                    </span>
                    {selectedFont === font.value && <span className="text-[#0052FF] text-lg">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Canvas Background with Text Overlay */}
          <div className="relative w-full max-w-2xl mx-auto mb-6 rounded-xl overflow-hidden shadow-lg">
            <img src="/canvas-bg.svg" alt="Canvas Background" className="w-full h-auto block" />
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <p
                className="text-white text-center font-light text-lg leading-relaxed whitespace-pre-wrap break-words max-h-full overflow-hidden"
                style={{ fontFamily: selectedFont }}
              >
                {canvasContent || "Start typing your note..."}
              </p>
            </div>
          </div>

          {/* Text Input */}
          <textarea
            value={canvasContent}
            onChange={(e) => setCanvasContent(e.target.value)}
            placeholder="Write your note here... (it will appear on the canvas above)"
            className="w-full p-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0052FF] min-h-32 transition-all duration-200 font-light"
          />

          {/* Auto-save Indicator */}
          {draftNote.lastSaved && <p className="text-xs text-muted-foreground mt-2">Saved on {draftNote.lastSaved}</p>}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSaveNote}
              className="flex-1 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Note
            </Button>
            <Button
              onClick={() => {
                setIsCanvasMode(false)
                setCanvasContent("")
              }}
              variant="outline"
              className="flex-1 rounded-lg bg-transparent hover:bg-muted transition-all duration-200 hover:scale-105"
            >
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        /* Create Note Button */
        <Button
          onClick={() => setIsCanvasMode(true)}
          className="w-full bg-[#0052FF] hover:bg-[#0052FF]/90 text-white rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 py-6 text-base"
        >
          <FileText className="w-5 h-5 mr-2" />
          Create New Note on Canvas
        </Button>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <Card className="p-12 text-center shadow-md hover:shadow-lg transition-all duration-300">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4 transition-transform duration-300" />
          <p className="text-muted-foreground">No notes yet</p>
          <p className="text-sm text-muted-foreground/60 mt-2">Create your first note to get started</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Card key={note.id} className="p-4 shadow-md hover:shadow-lg transition-all duration-300 relative">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{note.title}</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="px-3 py-2 rounded-lg hover:bg-muted transition-all duration-200"
                      onClick={() => handleMintNFT(note)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" /> Mint NFT
                    </Button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-2 hover:bg-muted rounded transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Created on {note.createdAt}</p>
                <div className="rounded-lg border border-input bg-background p-4">
                  <p className="whitespace-pre-wrap break-words" style={{ fontFamily: note.font || "Inter, sans-serif" }}>
                    {note.content}
                  </p>
                </div>
                {note.isMinted && (
                  <div className="absolute top-2 right-2 bg-[#0052FF] text-white text-xs px-2 py-1 rounded">
                    Minted
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}