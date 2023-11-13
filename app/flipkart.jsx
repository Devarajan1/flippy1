'use client'
import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import send from '@/public/assets/ChatPanel_Send.svg'
import { Button } from "@/components/ui/button"
import { MoveRight, Compass, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios'
import { marked } from 'marked';
import ReactMarkdown from 'react-markdown'
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
export default function FlipcartScrape() {
    const [userMsg, setUserMsg] = useState('')
    const [url, setUrl] = useState('')
    const [scraping, setScraping] = useState(false)
    const [streamData, setStreamData] = useState('')
    const [stream, setStream] = useState(false)
    const [message, setMessage] = useState([])
    const textareaRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [chatLoader, setChatloader] = useState(false)
    const [similarProd, setSimilarProd] = useState([])
    const [reviewDrop, setReviewDrop] = useState(false)
    const [chatId, setChatId] = useState(null)
    const [sp, setSp] = useState(false)
    const [reviewsData, setReviewsData] = useState(false);
    const [summary, setSummary] = useState(false)
    const [callOut, setCallout] = useState(false)
    const [trend, setTrend] = useState(false)
    const [responseData, setResponeData] = useState([])

    useEffect(() => {
        textareaRef.current.focus();
    }, []);

    useEffect(() => {
        const chatContainer = chatContainerRef.current;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, [message])

    async function scrape() {
        if (url && url.trim() !== "") {
            setChatId()
            trigger();

            setScraping(true)
            var myInput = document.getElementById('urlInput');
            myInput.style.outline = 'none';
            try {
                const response = await axios.post('http://flipkart-chatbot.hexonlabs.com:5001/bot/scrape', {
                    url: url
                })

                setChatId(response.data.data.id)
                const newMessage = {
                    bot: response.data.data.response
                }
                setMessage((prevMessage) => [...prevMessage, newMessage])
                setScraping(false)
                SimilarProducts(response.data.data.id);
            }
            catch (error) {

                setScraping(false)
              
                console.log('Error', error)
            }
        }
        else if (url?.length == 0 || url.trim()?.length == 0) {
            var myInput = document.getElementById('urlInput');
            myInput.style.outlineColor = ' #ff8a90';
        }
    }


    async function chat(value) {
        if (value && value.trim() && url && url.trim() !== "") {

            setChatloader(true)
            var myInput = document.getElementById('urlInput');
            myInput.style.outline = 'none';
            var myInput1 = document.getElementById('chat');
            myInput1.style.outline = 'none';
            const newUserMsg = {
                user: value
            }
            setMessage((prevMessage) => [...prevMessage, newUserMsg])
            try {
                const response = await fetch(
                    'http://flipkart-chatbot.hexonlabs.com:5001/bot/qna'
                    , {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            url: url,
                            id: chatId,
                            query: value
                        }),
                    });

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let partialResponse = '';

                const processResult = async (result) => {

                    if (result.done) {
                        setChatloader(false)
                        setStream(false)
                        const newMsg = {
                            bot: partialResponse
                        }
                        setMessage((prevMessage) => [...prevMessage, newMsg])
                        return;
                    }

                    const chunk = decoder.decode(result.value, { stream: true });
                    partialResponse += chunk;
                    setStream(true)

                    setStreamData(partialResponse)
                    // Process and handle the streamed response chunk
                    return reader.read().then(processResult);
                };

                return reader.read().then(processResult);
            } catch (error) {
                setChatloader(false)
                console.log(`Error occurred while fetching the response.\n${error}`);
                // isRequestInProgress = false;
            }
        }
        else if (url?.length == 0 || url.trim()?.length == 0) {
            var myInput = document.getElementById('urlInput');
            myInput.style.outlineColor = '#ff8a90';
        }
        else if (value?.length == 0 || value.trim()?.length == 0) {
            var myInput1 = document.getElementById('chat');
            myInput1.style.borderRadius = '5px';
            myInput1.style.outlineColor = '#ff8a90';
        }
    }
    async function SimilarProducts(value) {

        try {
            const response = await fetch(
                'http://flipkart-chatbot.hexonlabs.com:5001/bot/qna/similar'
                , {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: 'share few similar products',
                        id: value
                    }),
                });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let partialResponse = '';

            const processResult = async (result) => {

                if (result.done) {
                    setSimilarProd(marked.parse(partialResponse));

                    return;
                }
                const chunk = decoder.decode(result.value, { stream: true });
                partialResponse += chunk;

                return reader.read().then(processResult);
            };
            return reader.read().then(processResult);
        } catch (error) {

            console.log(`Error occurred while fetching the response.\n${error}`);
            // isRequestInProgress = false;


        }
    }
    async function trigger() {
        try {
            const formData = new FormData();
            formData.append('url', url);
            formData.append('override', false);

            const response = await axios.post('http://54.193.47.187/vetri/trigger-summary', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Set the content type to form data
                },
            });

            // Process the response
            console.log(response.data);

            // Assuming getReviewData is a function that needs to be called after the POST request
            getReviewData();
        } catch (error) {
            console.log('Error', error);
        }
    }
    async function getReviewData() {
        try {
            const formData = new FormData();
            formData.append('url', url);
           
            const response = await axios.post('http://54.193.47.187/vetri/get-summary', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Set the content type to form data
                },

            })
            console.log(await response)
            setResponeData(response)
        }
        catch (error) {
            console.log('Error', error)
        }
    }

    return (

        <div className="w-full h-full  overflow-x-hidden bg-[#fafafa] CS" >
            {/*fafafa */}
            <div className="w-full  flex justify-between">
                <div className="p-4  bg-[#f3f6fc] mx-4 mt-1 font-bold rounded-sm border-[0.02rem]">
                    <p>FLIPPY</p>
                    <span className="text-[.8rem] text-[#c7c7c7] font-normal">(For Smartphones)</span>
                </div>

                {/* <Link className="bg-transperent text-black bg-[rgb(0,0,255,0.1)] p-4 mt-1 rounded-sm flex" href="/">Multimodal <span><MoveRight className="ml-2 w-4" /></span></Link>*/}
            </div>
            <div className="w-full h-[75%] md:flex  " >
                <div className="md:w-1/4 md:h-full  w-full  h-[200px]">
                    <div className="bg-[#f3f5fa] rounded-lg	m-4 p-4 border-[0.05rem]">
                        <div className="p-2 w-full ">
                            <Select className="w-full">
                                <SelectTrigger >
                                    <SelectValue placeholder="Select One" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="select one">Select One</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="p-2 w-full">
                            <input
                                id="urlInput"
                                ref={textareaRef}
                                onChange={(e) => setUrl(e.target.value)}
                                className=" outline-none   border-2 p-2 bg-transparent w-full rounded-lg" typr="text" placeHolder="Enter URL" />
                        </div>
                        <div className="w-full flex justify-center mt-2">
                            <Button className="bg-[#dcdcdc] text-[#121212] hover:bg-[#c1c0c0] rounded-lg p-4 " onClick={() => scrape()}>Submit</Button>
                        </div>

                    </div>
                    <p className="font-bold m-4 mt-8">Product Details</p>
                    <div className=" p-4  bg-[#f3f6fc] m-4 flex flex-col rounded-lg border-[0.05rem] ">
                        <p className=" bg-transperent p-2 rounded-sm hover:cursor-pointer text-[#121212] hover:bg-[rgba(224,231,252,0.5)] ">Description</p>
                        <p className=" bg-transperent p-2 rounded-sm hover:cursor-pointer text-[#121212] hover:bg-[rgba(224,231,252,0.5)] " onClick={() => { setSp(!sp); setReviewsData(false) }}>Similar Products</p>
                        <p className=" bg-transperent p-2  rounded-sm hover:cursor-pointer text-[#121212] hover:bg-[rgba(224,231,252,0.5)] flex" onClick={() => { setReviewDrop(!reviewDrop); getReviewData(); setSp(false); setReviewsData(!reviewsData) }}><span className="mr-2">{!reviewDrop ? <Plus /> : <Minus />}</span>Reviews</p>
                        {reviewDrop ?
                            <div className="ml-14">
                                <p className=" bg-transperent p-2  rounded-sm hover:cursor-pointer text-[#121212] hover:bg-[rgba(224,231,252,0.5)]">Summary</p>
                                <p className=" bg-transperent p-2  rounded-sm hover:cursor-pointer text-[#121212] hover:bg-[rgba(224,231,252,0.5)]">Call Outs</p>
                                <p className=" bg-transperent p-2  rounded-sm hover:cursor-pointer text-[#121212] hover:bg-[rgba(224,231,252,0.5)]">Trends</p>
                            </div>
                            : null}

                    </div>
                </div>

                <div className="md:w-3/4 md:h-[100%] w-full relative border-2  rounded-3xl bg-[#f3f6fc]	 mr-2 mt-4 p-4 ">
                    <div className="w-full max-h-[90%] grid overflow-y-scroll CS " ref={chatContainerRef}>
                        {!scraping && message.length == 0 && userMsg.length == 0 ? <p className="font-bold text-[rgb(191,212,250,0.8)] mt-[15%] text-[4rem] justify-center text-center tracking-widest	">FLIPPY!<span className="text-[.8rem] text-[#c7c7c7] font-normal">(For Smartphones)</span>
</p>
                   : null}
                        <>  {message?.map((messages, index) => (
                            <>
                                {messages.user?.length > 0 ?
                                    <ReactMarkdown className="max-w-[90%] min-w-[0] w-[fit-content] p-4 m-2 justify-self-end bg-[rgb(179,204,250)] text-[#121212] rounded-lg" style={{ borderTopRightRadius: 0 }}>{messages.user}</ReactMarkdown>
                                    : null}
                                {message?.length == index + 1 && stream ?
                                    <ReactMarkdown className="max-w-[90%] min-w-[0] w-[fit-content] p-4 m-2 bg-[#ffff] text-[#121212] rounded-lg"
                                        components={{
                                            pre: ({ node, ...props }) => (
                                                <div className="overflow-auto CS w-full my-2 bg-[#121212] p-2 rounded-lg">
                                                    <pre {...props} />
                                                </div>
                                            ),
                                            code: ({ node, ...props }) => (
                                                <code className="bg-[#121212] rounded-lg p-1" {...props} />
                                            ),
                                            ul: ({ node, ...props }) => (
                                                <ul className="md:pl-10 leading-8" style={{ listStyleType: 'auto' }}  {...props} />
                                            ),
                                            ol: ({ node, ...props }) => (
                                                <ol className="md:pl-10 leading-8" style={{ listStyleType: 'auto' }} {...props} />
                                            ),
                                            menu: ({ node, ...props }) => (
                                                <p className="md:pl-10 leading-8" style={{ listStyleType: 'auto' }} {...props} />
                                            ),
                                        }}>{streamData}</ReactMarkdown>
                                    : null}

                                {messages.bot?.length > 0 ?
                                    <ReactMarkdown className="max-w-[90%] min-w-[0] w-[fit-content] p-4 m-2 bg-[#ffff] text-[#121212] rounded-lg"
                                        components={{
                                            pre: ({ node, ...props }) => (
                                                <div className="overflow-auto CS w-full my-2 bg-[#121212] p-2 rounded-lg">
                                                    <pre {...props} />
                                                </div>
                                            ),
                                            code: ({ node, ...props }) => (
                                                <code className="bg-[#121212] rounded-lg p-1" {...props} />
                                            ),
                                            ul: ({ node, ...props }) => (
                                                <ul className="md:pl-10 leading-8" style={{ listStyleType: 'auto' }}  {...props} />
                                            ),
                                            ol: ({ node, ...props }) => (
                                                <ol className="md:pl-10 leading-8" style={{ listStyleType: 'auto' }} {...props} />
                                            ),
                                            menu: ({ node, ...props }) => (
                                                <p className="md:pl-10 leading-8" style={{ listStyleType: 'auto' }} {...props} />
                                            ),
                                        }}>{messages.bot}</ReactMarkdown>
                                    : null}
                            </>
                        ))}
                        </>
                        {chatLoader ?
                            <div className="flex items-center space-x-4 w-full">
                                <div className="space-y-2 w-full">
                                    <Skeleton className="h-8 w-[40%] bg-[#fff] " />
                                </div>
                            </div>
                            : null}
                        {scraping ? <div className="m-2 w-[12.5%] min-w-[100px] p-2 border-2 bg-[#fafafa] rounded-xl flex justify-around">
                            <Compass className="text-[#121212] spin" />
                            <p className="text-[#121212] font-semibold">Browsing</p>
                        </div> : null}
                        <div className=" flex  w-[95%] absolute bottom-4">
                            <div className="w-full border-2  bg-[#f3f6fc] rounded-lg	 ">
                                <input
                                    id="chat"
                                    onChange={(e) => setUserMsg(e.target.value)}
                                    className="p-4 w-full flex h-full bg-transparent outline-none focus:outline-none pr-10"
                                    type="text"
                                    value={userMsg}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !scraping) {
                                            chat(userMsg);
                                            setUserMsg('')
                                            e.preventDefault();
                                        }
                                    }}
                                    placeHolder="Send a message" />
                            </div>
                            <Image onClick={() => { !scraping ? (chat(userMsg), setUserMsg('')) : null }} src={send} alt="send" className="hover:cursor-pointer ml-[-2.5rem] flex " />

                        </div>
                    </div>
                </div>
            </div>
            {sp ? <div className="w-full   ">
                <p className="text-[#121212] m-4 font-bold text-2xl mt-10">Similar Products</p>
                <div className="flex flex-wrap w-[50%] m-2 p-2 bg-[#f3f6fc] border-2  rounded-3xl">
                    <div dangerouslySetInnerHTML={{ __html: similarProd }} />
                </div>
            </div> : null}
            {reviewsData ?
                <div className="md:w-[50%]  border-2  rounded-3xl bg-[#f3f6fc]	 m-4 mt-12 p-4 " >
                    <p className="text-[#121212] font-bold text-xl">Reviews:</p>
                    {responseData?.map(item => {
                        const { type, data } = item;

                        switch (type) {
                            case 'summary':
                                return summary ? <ReactMarkdown key={type}>{data.join('\n')}</ReactMarkdown> : null;
                            case 'callout':
                                return callOut ? <ReactMarkdown key={type}>{data.join('\n')}</ReactMarkdown> : null;
                            case 'trend':
                                return trend ? <ReactMarkdown key={type}>{data.join('\n')}</ReactMarkdown> : null;
                            default:
                                return null;
                        }
                    })}

                </div>
                : null}
        </div>
    )
}
