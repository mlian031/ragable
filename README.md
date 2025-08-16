# Ragable

This is an open source sample web-app that uses vercel's AI sdk. 

It's meant to serve as a quick mockup so there are many features that are lacking, and the code is not production ready. 

Uses gemini 2.5 pro via vertex AI, and has tool calling for generating:
- molecular diagrams and chemical structures via smiles strings
- web search via google search grounding
- code display (markdown)
- display mathematical graphs and plots

It supports file attachments, as well as direct copy paste into chat. 

Uses memoization in chat to maintain a 2 million token context window while being performant.

This has largely been a passion project for familiarizing my way around all the new LLM-centered tools and frameworks coming out, and overall was a fun experience.

Enjoy!
