from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import customer,platform
import uvicorn
import os

app = FastAPI()



app.include_router(customer.router)
app.include_router(platform.router)

origins = [
    'http://127.0.0.1:5500',
    'http://127.0.0.1:8000',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    # cmd = "python -m http.server 8888"
    # os.system(cmd)
    uvicorn.run(app=app, host="127.0.0.1", port=8000)
