# 1️⃣ Base image: lightweight Python
FROM python:3.12-slim

# 2️⃣ Prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

# 3️⃣ Ensure logs appear instantly (no buffering)
ENV PYTHONUNBUFFERED=1

# 4️⃣ Set working directory inside container
WORKDIR /app

# 5️⃣ Copy dependency file first (layer caching)
COPY requirements.txt /app/

# 6️⃣ Install Python dependencies
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# 7️⃣ Copy entire project into container
COPY . /app/

# 8️⃣ Expose Django port
EXPOSE 8000

# 9️⃣ Command to start Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]