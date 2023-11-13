'use client'
import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import send from '@/public/assets/ChatPanel_Send.svg'
import { Button } from "@/components/ui/button"
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
export default function ImageModel() {
    const inputRef = useRef()
    const [chatLoader, setChatloader] = useState(false)
    const [description, setDescription] = useState('')
    const [table, setTable] = useState([])
    const [descriptionActive, setDescriptionActive] = useState(true)
    const [tableActive, setTableActive] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null);

    const handleDrop = (e) => {
        e.preventDefault();

        const file = e.dataTransfer.files[0];

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }


    async function scrape() {
        try {
            const formData = new FormData();
            formData.append('image_file', selectedImage);
          
            const response = await axios.post('ec2-52-66-237-117.ap-south-1.compute.amazonaws.com:5050/upload_image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Set the content type to multipart/form-data
                },
            });
           
            await Description()
            await tableFunc()
        }
        catch (error) {
            console.log('Error', error)
        }
    }

    async function Description() {
        try {

            const response = await axios.get('http://ec2-52-66-237-117.ap-south-1.compute.amazonaws.com:5050/generate_image_caption');
            const modifiedValue = response.data.replace('</s>', '');
            console.log(response)
            setDescription(modifiedValue)
        }
        catch (error) {
            console.log('Error', error)
        }
    }
    async function tableFunc() {
        try {
            const response = await axios.get('http://ec2-52-66-237-117.ap-south-1.compute.amazonaws.com:5050/generate_key_value_response');
            setTable(response.data)
            console.log(response)
        }
        catch (error) {
            console.log('Error', error)
        }
    }
    return (

        <div className="w-[100vw] h-[100vh] overflow-x-hidden bg-[#fafafa] CS" >
            {/*fafafa */}
            <div className="w-full  flex justify-between">
                <p className="p-4 flex bg-[#f3f6fc] mx-4 mt-1 font-bold rounded-sm border-[0.02rem]">FLIPPY</p>
                {/* <Link className="bg-transperent text-black bg-[rgb(0,0,255,0.1)] p-4 mt-1 rounded-sm flex" href="/">Multimodal <span><MoveRight className="ml-2 w-4" /></span></Link>*/}
            </div>
            <div className="w-full h-[75%] md:flex  " >
                <div className="md:w-1/4 md:h-full  w-full  h-[100%]">
                    <div className="bg-[#f3f5fa] rounded-lg	m-4 p-4 border-[0.05rem]">
                        <div className="flex flex-col items-center justify-center ">
                            <div
                                className="w-64 h-64 border-4 border-dashed border-gray-400 relative"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                            >
                                {selectedImage ? (
                                    <img
                                        src={selectedImage}
                                        alt="Selected"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <>
                                        <div className="absolute left-[100%] top-[-1rem]"><XCircle /></div>
                                        <div className="flex flex-col justify-around w-full h-full p-4 relative">

                                            <p className="text-gray-600 text-center cursor-pointer" onClick={() => inputRef.current.click()}> Drag and Drop image or <span className="font-bold ">Click here</span></p>
                                            <input
                                                className="hidden"
                                                type="file"
                                                accept="image/*"
                                                ref={inputRef}
                                                onChange={handleFileInputChange}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                        </div>
                        {/*<div className="w-full flex justify-center">
                            <p className="p-2 px-3 border-2 mt-4" style={{ borderRadius: '50%' }}>or</p>
                        </div>
                                */}
                        <div className="w-full flex justify-center mt-4">
                            <Button className="bg-[#dcdcdc] text-[#121212] hover:bg-[#c1c0c0] rounded-lg p-4 " onClick={() => scrape()}>Submit</Button>
                        </div>
                    </div>
                </div>


                {/*   response  */}

                <div className="md:w-3/4 w-full relative">
                    <div className="flex w-full m-4">
                        <Button className=" mr-6 bg-[#cdddfc] text-[#121212] hover:bg-[#ecf1fc]" onClick={() => { setDescriptionActive(true); setTableActive(false) }}>Captions</Button>
                        <Button className="mr-6 bg-[#cdddfc] text-[#121212] hover:bg-[#ecf1fc]" onClick={() => { setDescriptionActive(false); setTableActive(true) }}>Attributes</Button>
                        <Button className="mr-6 bg-[#e0e0e0] text-[#121212] hover:bg-[#e0e0e0] hover:cursor-default">Variations</Button>
                    </div>
                    <div className="md:w-full md:h-[100%]   border-2  rounded-3xl bg-[#f3f6fc]	 mr-2 mt-4 p-4 " >
                        {descriptionActive ? <ReactMarkdown>{description}</ReactMarkdown> : null}
                        {tableActive ? <div>{table}</div> : null}
                    </div>
                </div>
            </div>
        </div>
    )
}
