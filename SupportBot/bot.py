import telebot
import requests
import os
import uuid
from pathlib import Path

# ── Configuration from environment variables ─────────────────────────
TOKEN = os.environ.get(
    "CHAT_BOT_TOKEN", "5173389964:AAHuic8a_je7sn-iEj8bVBrKSKTH_ncJvG0"
)
ADMIN_IDS = os.environ.get("ADMIN_IDS", "").split(",")
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:5071")
API_KEY = os.environ.get("ADMIN_API_KEY", "your-secret-api-key-here")


# API Endpoints
API_ADD_MESSAGE = f"{API_BASE_URL}/api/Chat/AddMessage"

bot = telebot.TeleBot(TOKEN)

# Per-chat state management (keyed by chat.id)
chat_states = {}


def get_state(chat_id):
    if chat_id not in chat_states:
        chat_states[chat_id] = {"state": "IDLE", "data": {}}
    return chat_states[chat_id]


def set_state(chat_id, state, data=None):
    chat_states[chat_id] = {"state": state, "data": data or {}}


def clear_state(chat_id):
    chat_states[chat_id] = {"state": "IDLE", "data": {}}


def is_admin(user_id):
    return True


def api_headers():
    return {"X-Api-Key": API_KEY, "Content-Type": "application/json"}


# ── /cancel command ────────────────────────────────────────────────────
@bot.message_handler(commands=["cancel"])
def cancel_command(message):
    clear_state(message.chat.id)
    bot.reply_to(message, "✅ Operación cancelada.")


# ── /recarga command ───────────────────────────────────────────────────
@bot.message_handler(commands=["sendMessage"])
def iniciar_recarga(message):

    if not is_admin(message.from_user.id):
        bot.reply_to(message, "❌ No tienes permisos para realizar esta acción.")
        return

    bot.reply_to(
        message, "⚠️ Por favor envíe el número del usuario al que desea responder"
    )
    set_state(message.chat.id, "WAITING_PHONE_CHAT")


@bot.message_handler(
    func=lambda m: get_state(m.chat.id)["state"] == "WAITING_PHONE_CHAT"
)
def recibir_phone_chat(message):
    state = get_state(message.chat.id)
    state["data"]["phone"] = message.text.strip()
    bot.reply_to(
        message,
        "⬇️ Por favor envíe el mensaje",
    )
    set_state(message.chat.id, "WAITING_MESSAGE", state["data"])


@bot.message_handler(func=lambda m: get_state(m.chat.id)["state"] == "WAITING_MESSAGE")
def recibir_mensaje(message):
    try:
        text = message.text

        state = get_state(message.chat.id)
        phone = state["data"]["phone"]

        payload = {"Message": text, "UserPhone": phone, "IsFromAdmin": True}
        response = requests.post(API_ADD_MESSAGE, json=payload, headers=api_headers())

        if response.status_code == 200:

            bot.reply_to(message, "Mensaje enviado con éxito")
        else:
            error_msg = response.json().get("message", "Error desconocido")
            bot.reply_to(message, f"❌ Error: {error_msg}")
    except ValueError:
        bot.reply_to(message, "❌ Por favor ingrese orden valida")
    except Exception as e:
        bot.reply_to(message, f"❌ Error: {str(e)}")
    finally:
        clear_state(message.chat.id)


try:
    print("Bot está escuchando...")
    bot.polling(none_stop=True, interval=0)
except Exception as e:
    print(f"Error en el bot: {e}")
