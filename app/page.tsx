'use client'
import React from 'react'
import ImageModel from './image-model/page'
import Flipcart_scrape from './flipkart'
export default function Home() {
  return (
    <div className="w-[100vw] h-[100vh]">
   < Flipcart_scrape />
    </div>
  )
}
