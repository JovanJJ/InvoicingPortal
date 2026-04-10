'use client'
import { useState, useRef } from 'react'
import { uploadProfileImage } from "@/lib/actions"
import Image from 'next/image'

export default function ImageUpload({ currentImage }) {
  const [preview, setPreview] = useState(currentImage || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)


  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return


    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB')
      return
    }


    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setError(null)


    handleUpload(file)
  }

  async function handleUpload(file) {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      const url = await uploadProfileImage(formData)
      setPreview(url)
    } catch (err) {
      setError(err.message)
      setPreview(currentImage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">


      <div
        className="relative w-48 h-48 rounded-full cursor-pointer group overflow-hidden border-2 border-green-300 hover:border-green-500 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Profile"
              fill
              className="object-cover"
            />

          </>
        ) : (

          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <span className="text-2xl">📷</span>
            <span className="text-xs text-gray-400 mt-1">Upload</span>
          </div>
        )}


        {loading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>


      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />


      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-sm hover:text-green-400 cursor-pointer font-medium"
        disabled={loading}
      >
        {loading ? 'Uploading...' : preview ? 'Change photo' : 'Upload photo'}
      </button>


      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}


      <p className="text-xs text-gray-400">JPG, PNG or WEBP, max 2MB</p>
    </div>
  );

}