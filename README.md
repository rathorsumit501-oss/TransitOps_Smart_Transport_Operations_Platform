# TransitOps: Smart Transport Operations Platform

## Local development

### Backend

```powershell
.\.venv\Scripts\Activate.ps1
cd transitops\backend
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`; interactive documentation is at
`http://127.0.0.1:8000/docs`.

### Frontend

```powershell
cd transitops\frontend
npm run dev
```
