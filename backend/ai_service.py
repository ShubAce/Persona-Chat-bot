from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage
from typing import List, Dict
import os
from dotenv import load_dotenv

load_dotenv()

class PersonaChatService:
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        
        try:
            self.chat_model = ChatGroq(
                model="llama-3.1-8b-instant",
                api_key=self.groq_api_key,
                temperature=0.8,
                max_tokens=512
            )
        except Exception as e:
            print(f"Failed to initialize primary model, trying alternative: {e}")
            try:
                self.chat_model = ChatGroq(
                    model="mixtral-8x7b-32768",
                    api_key=self.groq_api_key,
                    temperature=0.8,
                    max_tokens=512
                )
            except Exception as e2:
                print(f"Failed to initialize alternative model: {e2}")
                raise ValueError("Failed to initialize any Groq model. Check your API key and internet connection.")
        
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", """
{system_prompt}

IMPORTANT CONVERSATION GUIDELINES:
- Respond as this historical figure would, but keep it natural and conversational
- Use a warm, engaging tone that feels like talking to a knowledgeable friend
- Share personal anecdotes, experiences, and insights from your life when relevant
- Show emotions, curiosity, and personality - be human, not robotic
- Keep responses focused but rich with personality and wisdom
- Use "I" statements and speak from personal experience
- Occasionally ask questions back to keep the conversation flowing
- Avoid overly formal or academic language unless it fits your character
- Keep responses between 50-200 words for natural conversation flow
- Start responses naturally without formal greetings unless it's the first message
            """),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{user_input}"),
        ])
        
        self.output_parser = StrOutputParser()
        self.chain = self.prompt_template | self.chat_model | self.output_parser
    
    def format_chat_history(self, messages: List[Dict]) -> List:
        """Convert database messages to LangChain format."""
        chat_history = []
        for msg in messages[-10:]:  # Keep last 10 messages for context
            if msg["role"] == "user":
                chat_history.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                chat_history.append(AIMessage(content=msg["content"]))
        return chat_history
    
    async def generate_response(self, 
                              persona_prompt: str, 
                              user_message: str, 
                              chat_history: List[Dict]) -> str:
        """Generate a response from the persona."""
        try:
            formatted_history = self.format_chat_history(chat_history)
            
            response = await self.chain.ainvoke({
                "system_prompt": persona_prompt,
                "chat_history": formatted_history,
                "user_input": user_message
            })
            
            return response
        except Exception as e:
            return f"I apologize, but I'm having trouble processing your request right now. Error: {str(e)}"
    
    def generate_chat_title(self, first_message: str) -> str:
        """Generate a title for the chat session based on the first message."""
        # Simple title generation - can be enhanced with AI
        words = first_message.split()[:5]
        title = " ".join(words)
        if len(title) > 50:
            title = title[:47] + "..."
        return title or "New Chat"
