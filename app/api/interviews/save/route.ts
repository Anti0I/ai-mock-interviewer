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
        const { messages, jobTitle = "Rozmowa Techniczna" } = body;

        const lastMessage = messages[messages.length - 1];
        const feedbackText = lastMessage?.role === 'assistant'
            ? (lastMessage.content || lastMessage.parts?.[0]?.text || "Brak podsumowania")
            : null;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.credits <= 0) {
            return new NextResponse("Brak wystarczających kredytów", { status: 403 });
        }

        const interview = await prisma.$transaction(async (tx) => {

            await tx.user.update({
                where: { id: userId },
                data: { credits: { decrement: 1 } }
            });

            return await tx.interview.create({
                data: {
                    userId: userId,
                    jobTitle: jobTitle,
                    status: "COMPLETED",
                    feedback: feedbackText,

                    messages: {
                        create: messages.map((m: any) => ({
                            role: m.role === 'user' ? 'user' : 'ai',
                            content: m.content || m.parts?.map((p: any) => p.text).join('') || '',
                        }))
                    }
                }
            });
        });

        return NextResponse.json(interview);

    } catch (error) {
        console.error("Błąd podczas zapisu wywiadu:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}