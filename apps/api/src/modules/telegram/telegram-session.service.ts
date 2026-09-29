import { Injectable } from '@nestjs/common';

interface TelegramSession {
    userId: string;
    exerciseId?: string;

    // Последний SQL-запрос пользователя
    lastQuery?: string;

    // Результат последнего выполнения SQL
    lastExecutionResult?: string;

    // Текущая AI-сессия
    aiConversationId?: string;

    // Пользователь сейчас общается с AI
    awaitingAi?: boolean;
}

@Injectable()
export class TelegramSessionService {
    private readonly sessions = new Map<bigint, TelegramSession>();

    setExercise(
        telegramUserId: bigint,
        userId: string,
        exerciseId: string,
    ) {
        this.sessions.set(telegramUserId, {
            userId,
            exerciseId,
        });
    }

    getSession(telegramUserId: bigint) {
        return this.sessions.get(telegramUserId);
    }

    setLastQuery(
        telegramUserId: bigint,
        query: string,
    ) {
        const session = this.sessions.get(telegramUserId);

        if (!session) {
            return;
        }

        session.lastQuery = query;
    }

    setLastExecutionResult(
        telegramUserId: bigint,
        result: string,
    ) {
        const session = this.sessions.get(telegramUserId);

        if (!session) {
            return;
        }

        session.lastExecutionResult = result;
    }

    setAiMode(
        telegramUserId: bigint,
        awaitingAi: boolean,
    ) {
        const session = this.sessions.get(telegramUserId);

        if (!session) {
            return;
        }

        session.awaitingAi = awaitingAi;
    }

    setAiConversationId(
        telegramUserId: bigint,
        conversationId: string,
    ) {
        const session = this.sessions.get(telegramUserId);

        if (!session) {
            return;
        }

        session.aiConversationId = conversationId;
    }

    clearAiConversation(telegramUserId: bigint) {
        const session = this.sessions.get(telegramUserId);

        if (!session) {
            return;
        }

        session.aiConversationId = undefined;
        session.awaitingAi = false;
    }

    clearExerciseContext(telegramUserId: bigint) {
        const session = this.sessions.get(telegramUserId);

        if (!session) {
            return;
        }

        session.exerciseId = undefined;
        session.lastQuery = undefined;
        session.lastExecutionResult = undefined;
        session.aiConversationId = undefined;
        session.awaitingAi = false;
    }
}