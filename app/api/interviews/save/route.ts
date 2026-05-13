import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { interviewId, messages, isCompleted = true } = body;

        if (!interviewId) {
            return new NextResponse("Brak interviewId", { status: 400 });
        }

        const interview = await prisma.interview.findUnique({
            where: { id: interviewId }
        });

        if (!interview || interview.userId !== userId) {
            return new NextResponse("Nie znaleziono wywiadu", { status: 404 });
        }

        const lastMessage = messages[messages.length - 1];
        const feedbackText = lastMessage?.role === 'assistant'
            ? (lastMessage.content || lastMessage.parts?.[0]?.text || "Brak podsumowania")
            : null;

        await prisma.message.deleteMany({
            where: { interviewId }
        });

        const newStatus = isCompleted ? "COMPLETED" : "INTERRUPTED";

        const updated = await prisma.interview.update({
            where: { id: interviewId },
            data: {
                status: newStatus,
                feedback: isCompleted ? feedbackText : "Wywiad przerwany",
                messages: {
                    create: messages.map((m: any) => ({
                        role: m.role === 'user' ? 'user' : 'ai',
                        content: m.content || m.parts?.map((p: any) => p.text).join('') || '',
                    }))
                }
            }
        });

        return NextResponse.json(updated);

    } catch (error) {
        console.error("Błąd podczas zapisu wywiadu:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}