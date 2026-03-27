# NLM + Antigravity bundle

Этот архив разворачивает связку NotebookLM MCP + skill для Antigravity на новом хосте.

## Что внутри
- `install.sh` — автоустановка CLI + MCP setup + skill install
- `skill/` — установленный skill (справка/референсы)

## Важно про креды
По соображениям безопасности и из-за хост-зависимости токенов, в архив **не включены живые OAuth/cookie креды**.
Их нужно авторизовать на целевом хосте один раз командой:

```bash
nlm login --profile work
nlm login --check --profile work
```

Это надёжнее, чем переносить токены между машинами.

## Установка на целевом хосте

```bash
tar -xzf nlm-antigravity-bundle.tar.gz
cd nlm-antigravity-bundle
chmod +x install.sh
./install.sh
```

После этого:
1. Выполни `nlm login --profile work`
2. Перезапусти Antigravity
3. В чате Antigravity проверь доступ:
   - попроси показать MCP tools notebooklm
   - вызови `notebook_list`

## Использование конкретного notebook
Для твоего research notebook:
`4582b79d-0273-4f5e-a86a-66959834ef68`

Добавь в стартовый промпт агенту:
- использовать только этот notebook как read-only источник
- перед каждым решением вытаскивать факты из notebook
- если данных нет — запросить уточнение, не фантазировать
