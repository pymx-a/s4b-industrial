---
description: Восстановление авторизации NotebookLM через прокси 2081 и cookies.txt
---

# Инструкция по работе с NotebookLM (NLM) через локальный прокси

Этот воркфлоу используется для восстановления доступа к NotebookLM, когда автоматическая авторизация невозможна (headless/CLI), а куки из `cookies.txt` протухли.

## 1. Параметры окружения
- **Локальный прокси**: `http://localhost:2081` (SOCKS5/HTTP)
- **Профиль NLM**: `work` (maxim.golubov@gmail.com)
- **Конфиг профиля**: `~/.notebooklm-mcp-cli/profiles/work/cookies.json`

## 2. Команды для работы (всегда через прокси)
Перед любой командой `nlm` или `notebooklm-mcp` необходимо устанавливать переменные окружения:
```bash
export HTTPS_PROXY=http://localhost:2081
export HTTP_PROXY=http://localhost:2081
```

## 3. Алгоритм восстановления при "Authentication expired"

### Шаг А: Получение свежих кук
Скопируйте fresh-куки из браузера (режим инкогнито на notebooklm.google.com) в файл `/home/ansible/share/cookies.txt` (формат Netscape).

### Шаг Б: Конвертация в JSON-массив (Critical)
Файл `cookies.json` в профиле `work` **обязательно** должен быть массивом объектов, а не строкой.

// turbo
```bash
python3 -c '
import json, time, os
cookies = []
src = "/home/ansible/share/cookies.txt"
dst = os.path.expanduser("~/.notebooklm-mcp-cli/profiles/work/cookies.json")
with open(src, "r") as f:
    for line in f:
        if line.startswith("#") or not line.strip(): continue
        p = line.split("\t")
        if len(p) >= 7:
            cookies.append({
                "name": p[5], "value": p[6].strip(), 
                "domain": p[0], "path": p[2], 
                "secure": p[3].lower() == "true", 
                "httpOnly": p[1].lower() == "true",
                "expirationDate": int(p[4]) if p[4].isdigit() else int(time.time() + 2592000)
            })
with open(dst, "w") as f:
    json.dump(cookies, f, indent=2)
print(f"DONE: Created JSON array {dst}")
'
```

### Шаг В: Валидация
// turbo
```bash
export HTTPS_PROXY=http://localhost:2081 && nlm login --check --profile work && nlm notebook list --profile work
```

## 4. Использование в MCP
Если MCP-сервер падает с ошибкой парсинга JSON (из-за дебаг-логов), используйте консольную утилиту `nlm` через прокси для извлечения данных, пока сервер не будет пропатчен.

---
**Критерий успеха**: `nlm login --check` возвращает `Authentication valid!`.
