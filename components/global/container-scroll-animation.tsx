'use client'
import React, { useRef } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import Image from 'next/image'

export const ContainerScroll = ({
  titleComponent,
}: {
  titleComponent: string | React.ReactNode
}) => {
  const containerRef = useRef<any>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
  })
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1]
  }

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0])
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions())
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100])

  // Opacidade para as linhas no fundo
  const gridOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.2])

  return (
    <div
      className="w-screen h-[80rem] flex relative gap-8 mx-auto items-center justify-center "
      ref={containerRef}
    >
      {/* Fundo com Grades */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          opacity: gridOpacity,
        }}
      >
        <div className="grid-lines"></div>
      </motion.div>

      <div
        className="py-20 w-full relative"
        style={{
          perspective: '1000px',
        }}
      >
        <Header
          translate={translate}
          titleComponent={titleComponent}
        />
        <Card
          rotate={rotate}
          translate={translate}
          scale={scale}
        />
      </div>
    </div>
  )
}

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-screen mx-auto text-center w-screen gap-8 p-4"
    >
      {titleComponent}
    </motion.div>
  )
}

export const Card = ({
  rotate,
  scale,
  translate,
}: {
  rotate: any
  scale: any
  translate: any
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate, // Rotate in X-axis
        scale,
        boxShadow:
          '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
      }}
      className="max-w-[90%]  h-[28rem] md:h-[46rem] bg-[#040618] rounded-[30px] shadow-2xl mx-auto w-screen gap-8 p-4"
    >
      <div className="bg-gray-100 h-full rounded-2xl overflow-hidden transition-all mx-auto w-[90%] ">
        <div className="">
          <Image
            src="/tela2.png"
            alt="bannerImage"
            className="object-cover w-full h-full border-8 rounded-2xl"
            width={1280}
            height={920} // Set proportional height
          />
        </div>
      </div>
    </motion.div>
  )
}
