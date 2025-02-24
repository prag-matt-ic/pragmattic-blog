'use client'
import { useGSAP } from '@gsap/react'
import { useDebouncedValue, useDidUpdate, useViewportSize } from '@mantine/hooks'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/dist/ScrollTrigger'
import React, { type FC, useEffect, useRef, useState } from 'react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const ImageSequenceHeader: FC = () => {
  const header = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const viewportSize = useViewportSize()
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>()

  useEffect(() => {
    if (!canvas.current) return
    if (viewportSize.width === 0 || viewportSize.height === 0) return // First render value is 0
    if (!!loadedImages) return

    const intialSetup = async () => {
      // Image Dimensions: 1920 / 1080
      const imageAspect = 1920 / 1080
      const imageWidth = viewportSize.width
      const imageHeight = viewportSize.width / imageAspect
      canvas.current!.width = viewportSize.width
      canvas.current!.height = viewportSize.height

      const imageSrcs: string[] = Array.from(
        { length: 60 },
        (_, i) => `/images/bottle/pragma100${i + 1 < 10 ? `0${i + 1}` : i + 1}.png`,
      )

      const images = await loadImagesAndDrawFirstFrame({
        canvas: canvas.current!,
        imageSrcs: imageSrcs,
        imageWidth: imageWidth,
        imageHeight: imageHeight,
      })

      setLoadedImages(images)
    }

    intialSetup()
  }, [viewportSize, loadedImages])

  useGSAP(
    () => {
      if (!canvas.current || !loadedImages) return
      const context = canvas.current.getContext('2d', { alpha: true })
      if (!context) return

      // ScrollTrigger for updating image sequence frames
      ScrollTrigger.create({
        id: 'image-sequence',
        trigger: header.current,
        start: 0,
        end: 'bottom top', // End when the bottom of the header reaches the top of the viewport
        pin: '#content-wrapper', // Pin the content container so it doesn't scroll off the screen
        onUpdate: ({ progress }) => {
          const nextFrame = Math.floor(progress * loadedImages.length)
          const nextImage = loadedImages[nextFrame]
          if (!nextImage) return
          updateCanvasImage(context, canvas.current!, nextImage)
        },
      })
    },
    {
      dependencies: [loadedImages],
      scope: header,
    },
  )

  const [debouncedViewportSize] = useDebouncedValue(viewportSize, 500)

  useDidUpdate(() => {
    const handleViewportResize = () => {
      if (!debouncedViewportSize.width || !debouncedViewportSize.height || !loadedImages) return
      if (!canvas.current) return
      if (canvas.current.width === debouncedViewportSize.width) return
      canvas.current.width = debouncedViewportSize.width
      canvas.current.height = debouncedViewportSize.height
      const context = canvas.current.getContext('2d', { alpha: true })
      if (!context) return
      const progress = ScrollTrigger.getById('image-sequence')?.progress ?? 0
      const nextFrame = Math.floor(progress * loadedImages.length)
      const nextImage = loadedImages[nextFrame]
      if (!nextImage) return
      updateCanvasImage(context, canvas.current, nextImage)
    }
    handleViewportResize()
  }, [debouncedViewportSize])

  return (
    <>
      <header ref={header} className="relative h-[200lvh] w-full select-none overflow-hidden">
        <div id="content-wrapper" className="relative z-20 flex h-lvh w-full items-center justify-center">
          <h1 className="text-3xl font-extrabold tracking-tighter text-white md:text-[8.5vmax]">Animate Responsibly</h1>
          <canvas ref={canvas} className="pointer-events-none absolute scale-75 bg-transparent" />
        </div>
      </header>

      {/* Spacing */}
      <div className="h-[25vh] w-full" />
    </>
  )
}

export default ImageSequenceHeader

const loadImagesAndDrawFirstFrame = async ({
  canvas,
  imageSrcs,
  imageWidth,
  imageHeight,
}: {
  canvas: HTMLCanvasElement
  imageSrcs: string[]
  imageWidth: number
  imageHeight: number
}): Promise<HTMLImageElement[]> => {
  let images: HTMLImageElement[] = []
  let loadedCount = 0

  return new Promise<HTMLImageElement[]>(async (resolve, reject) => {
    const onImageLoad = (index: number, img: HTMLImageElement) => {
      // Draw the first frame ASAP
      if (index === 0) {
        const context = canvas.getContext('2d', { alpha: true })
        if (!context) return
        updateCanvasImage(context, canvas, img)
      }
      loadedCount++
      const hasLoadedAll = loadedCount === imageSrcs.length - 1
      if (hasLoadedAll) resolve(images)
    }

    const retries: { [imgIndex: number]: number } = {}
    const maxRetries = 3

    const onImageError = (i: number, img: HTMLImageElement) => {
      // Try reloading this image a couple of times. If it fails then reject.
      if (retries[i] < maxRetries) {
        console.warn(`Image ${i} failed to load. Retrying... ${retries[i]}`)
        img.src = `${imageSrcs[i]}?r=${retries[i]}`
        retries[i]++
      } else {
        reject()
      }
    }

    for (let i = 0; i < imageSrcs.length - 1; i++) {
      const img = new Image()
      img.src = imageSrcs[i]
      // Math.min for contain, Math.max for cover
      const scale = Math.max(canvas!.width / imageWidth, canvas!.height / imageHeight)
      img.width = imageWidth * scale
      img.height = imageHeight * scale
      img.addEventListener('load', (e: any) => onImageLoad(i, img))
      img.addEventListener('error', (e) => onImageError(i, img))
      images.push(img)
    }
  })
}

const updateCanvasImage = (
  renderingContext: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
) => {
  if (!renderingContext || !canvas || !image) throw new Error('Unable to update canvas')
  // If you need to center the image in the canvas:
  const offsetX = canvas.width / 2 - image.width / 2
  const offsetY = canvas.height / 2 - image.height / 2
  renderingContext.clearRect(0, 0, canvas.width, canvas.height)
  renderingContext.drawImage(image, offsetX, offsetY, image.width, image.height)
}
