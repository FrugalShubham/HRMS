import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Send, Bot } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/api/client';

export function AIPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');

  const chat = useMutation({
    mutationFn: (message: string) => apiClient.post('/ai/chat', { message }),
    onSuccess: (res, message) => {
      setMessages((m) => [
        ...m,
        { role: 'user', content: message },
        { role: 'assistant', content: res.data.data.reply },
      ]);
      setInput('');
    },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="AI HR Assistant" description="Policy questions, leave guidance, and HR automation" />
      <Card className="min-h-[480px] flex flex-col">
        <CardContent className="flex-1 flex flex-col p-4">
          <div className="flex-1 space-y-4 overflow-y-auto mb-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Bot className="h-12 w-12 mb-4 opacity-50" />
                <p>Ask about leave policies, attendance rules, or payroll</p>
              </div>
            )}
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                    m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) chat.mutate(input.trim());
            }}
          >
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask HRFlow AI..." disabled={chat.isPending} />
            <Button type="submit" size="icon" disabled={chat.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
