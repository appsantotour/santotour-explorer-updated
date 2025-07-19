import React, { useState } from 'react';
import Layout from '../layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label'; // Assuming Label might be from ui/label based on AuthPage
import { Link } from 'react-router-dom';
import AnimatedLogo from '../ui/animated-logo';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { Mail } from 'lucide-react';

const RecuperarSenhaPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Remove Supabase configuration check since it's always configured
    if (!email) {
        toast({
            title: "Campo Obrigatório",
            description: "Por favor, insira seu email.",
            variant: "warning",
        });
        setLoading(false);
        return;
    }

    // Ensure the redirect URL is correct for your application setup
    // This URL is where Supabase will send the user after they click the reset link.
    // You'll need a route and component (e.g., /update-password) to handle the password update.
    const redirectTo = `${window.location.origin}/login?view=update_password`; // Or a specific update-password page

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    if (error) {
      toast({
        title: "Erro na Recuperação",
        description: error.message || "Não foi possível enviar o email de recuperação. Verifique o email e tente novamente.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email Enviado",
        description: "Se o email estiver cadastrado, você receberá um link para redefinir sua senha.",
      });
    }
    setLoading(false);
  };

  return (
    <Layout showNavbar={false} showFooter={false}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-navy to-blue-700 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <AnimatedLogo className="h-20 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold font-inter text-navy">Recuperar Senha</CardTitle>
            <CardDescription className="font-roboto text-gray-600">
              Insira seu email para receber o link de redefinição.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordRecovery} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-recovery" className="font-inter font-medium text-gray-700">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                    id="email-recovery"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    required
                    className="pl-10 font-roboto"
                    disabled={loading}
                    />
                </div>
              </div>
              <Button type="submit" className="w-full bg-navy hover:bg-navy/90 font-inter py-2.5" disabled={loading}>
                {loading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                    </span>
                    ) : 'Enviar Link de Recuperação'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center mt-4">
            <Link to="/login" className="text-sm text-navy hover:underline font-roboto">
              Lembrou a senha? Voltar para Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default RecuperarSenhaPage;
