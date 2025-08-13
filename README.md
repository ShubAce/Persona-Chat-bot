# 🎭 Persona Chat - Historical Figure AI Chat Application

An interactive web application that allows users to have conversations with AI simulations of 54+ historical figures from across time and cultures.

## 🌟 Features

- **54+ Historical Personalities** - Chat with famous figures from ancient times to the modern era
- **Authentic Historical Context** - Each AI persona is limited to knowledge from their historical period
- **Wikipedia Images** - Authentic historical portraits and photographs for each personality
- **Smart Search & Filtering** - Find personalities by name, profession, or time period
- **Real-time Chat Interface** - Smooth, responsive chat experience
- **Session Management** - Continue previous conversations
- **Responsive Design** - Works on desktop and mobile devices

## 🏛️ Available Historical Figures

### Ancient World (6)

- **Socrates** (470-399 BC) - Greek Philosopher
- **Plato** (428-348 BC) - Greek Philosopher
- **Aristotle** (384-322 BC) - Greek Philosopher
- **Cleopatra VII** (69-30 BC) - Egyptian Pharaoh
- **Julius Caesar** (100-44 BC) - Roman Military Leader
- **Alexander the Great** (356-323 BC) - Macedonian Conqueror

### Scientists & Inventors (12)

- **Albert Einstein** (1879-1955) - Theoretical Physicist
- **Isaac Newton** (1643-1727) - Mathematician and Physicist
- **Marie Curie** (1867-1934) - Physicist and Chemist
- **Leonardo da Vinci** (1452-1519) - Artist and Inventor
- **Galileo Galilei** (1564-1642) - Astronomer and Physicist
- **Charles Darwin** (1809-1882) - Naturalist and Biologist
- **Nikola Tesla** (1856-1943) - Inventor and Electrical Engineer
- **Thomas Edison** (1847-1931) - Inventor and Businessman
- **Alexander Fleming** (1881-1955) - Microbiologist
- **Louis Pasteur** (1822-1895) - Microbiologist and Chemist
- **Johannes Kepler** (1571-1630) - Astronomer
- **Copernicus** (1473-1543) - Astronomer

### Political Leaders (12)

- **George Washington** (1732-1799) - First US President
- **Abraham Lincoln** (1809-1865) - 16th US President
- **Winston Churchill** (1874-1965) - British Prime Minister
- **Napoleon Bonaparte** (1769-1821) - French Emperor
- **Mahatma Gandhi** (1869-1948) - Indian Independence Leader
- **Martin Luther King Jr.** (1929-1968) - Civil Rights Leader
- **Nelson Mandela** (1918-2013) - Anti-Apartheid Leader
- **Theodore Roosevelt** (1858-1919) - 26th US President
- **Franklin D. Roosevelt** (1882-1945) - 32nd US President
- **John F. Kennedy** (1917-1963) - 35th US President
- **Thomas Jefferson** (1743-1826) - 3rd US President
- **Eleanor Roosevelt** (1884-1962) - First Lady and Activist

### Artists & Writers (11)

- **William Shakespeare** (1564-1616) - Playwright and Poet
- **Vincent van Gogh** (1853-1890) - Post-Impressionist Painter
- **Pablo Picasso** (1881-1973) - Artist
- **Michelangelo** (1475-1564) - Artist and Sculptor
- **Claude Monet** (1840-1926) - Impressionist Painter
- **Frida Kahlo** (1907-1954) - Mexican Artist
- **Jane Austen** (1775-1817) - English Novelist
- **Charles Dickens** (1812-1870) - English Novelist
- **Mark Twain** (1835-1910) - American Writer and Humorist
- **Edgar Allan Poe** (1809-1849) - American Writer and Poet
- **Oscar Wilde** (1854-1900) - Irish Writer and Playwright
- **Emily Dickinson** (1830-1886) - American Poet

### Musicians (3)

- **Wolfgang Amadeus Mozart** (1756-1791) - Austrian Composer
- **Ludwig van Beethoven** (1770-1827) - German Composer
- **Johann Sebastian Bach** (1685-1750) - German Composer

### Social Reformers (4)

- **Frederick Douglass** (1818-1895) - American Abolitionist
- **Harriet Tubman** (1822-1913) - American Abolitionist
- **Susan B. Anthony** (1820-1906) - Women's Rights Activist
- **Rosa Parks** (1913-2005) - Civil Rights Activist

### Innovators & Pioneers (2)

- **Alan Turing** (1912-1954) - Computer Scientist
- **Ada Lovelace** (1815-1852) - First Computer Programmer

### Business Leaders (3)

- **Henry Ford** (1863-1947) - Industrial Pioneer
- **Andrew Carnegie** (1835-1919) - Steel Magnate and Philanthropist
- **John D. Rockefeller** (1839-1937) - Business Magnate

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **GROQ API Key** (for AI responses)
- **HF Token**

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd persona_chat_app
```

2. **Set up the backend**

```bash
cd backend
pip install -r requirements.txt
```

3. **Configure environment variables**
   Create a `.env` file in the backend directory:

```env
GROQ_API_KEY=your_openai_api_key_here
HF_TOKEN=your personal token
DATABASE_URL=sqlite:///./persona_chat.db
```

4. **Set up the frontend**

```bash
cd ../frontend
npm install
```

5. **Start the application**

```bash
# Option 1: Use the provided batch files (Windows)
start_app.bat

# Option 2: Start manually
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

6. **Access the application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 🛠️ Technology Stack

### Backend

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Lightweight database
- **OpenAI API** - AI language model integration
- **Pydantic** - Data validation

### Frontend

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Heroicons** - Beautiful icons

## 📁 Project Structure

```
persona_chat_app/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── models.py            # Database models
│   ├── database.py          # Database configuration
│   ├── schemas.py           # Pydantic schemas
│   ├── ai_service.py        # OpenAI integration
│   ├── auth.py              # Authentication logic
│   ├── populate_personas.py # Database population script
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables
│   └── persona_chat.db      # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Main application pages
│   │   ├── services/        # API service functions
│   │   ├── contexts/        # React contexts
│   │   └── App.jsx          # Main React component
│   ├── package.json         # Node.js dependencies
│   └── vite.config.js       # Vite configuration
├── start_app.bat           # Start both frontend and backend
├── start_backend.bat       # Start backend only
├── start_frontend.bat      # Start frontend only
└── README.md              # This file
```

## 🎯 Usage

1. **Browse Personalities**: View all 54+ historical figures on the main dashboard
2. **Search & Filter**: Use the search bar or filter by profession/era
3. **Start Chatting**: Click on any personality to begin a conversation
4. **Historical Accuracy**: Each AI persona only knows information up to their death year
5. **Continue Conversations**: Resume previous chat sessions from the dashboard

## 🧠 AI Persona Behavior

Each historical figure AI is programmed to:

- **Stay in character** with authentic personality traits
- **Use period-appropriate language** and references
- **Limit knowledge** to their historical timeframe
- **Express curiosity** about modern developments they wouldn't know
- **Share personal experiences** and historical context from their era

## 🤝 Contributing

This is a college project demonstrating AI chatbot technology and historical education. Feel free to:

- Add more historical personalities
- Improve the UI/UX design
- Enhance the AI conversation quality
- Add new features like chat export or voice messages

## 📄 License

This project is for educational purposes. Please ensure you have proper API keys and respect usage limits.

## 🙏 Acknowledgments

- **OpenAI** for providing the open source language model
- **Chat Groq** for free api based llm services
- **Wikipedia** for historical images and information
- **All the historical figures** who made this conversation possible through their lasting legacies

---

**Start chatting with history today!** 🎭✨
