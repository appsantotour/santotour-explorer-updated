@echo off
:: Define a pasta a ser listada como a pasta onde o script est� localizado
set "PASTA=%~dp0"

:: Define o nome do arquivo de sa�da
set "ARQUIVO_SAIDA=%PASTA%lista_arquivos.txt"

:: Lista os arquivos e diret�rios em forma de �rvore e salva no arquivo de sa�da
tree "%PASTA%" /f /a > "%ARQUIVO_SAIDA%"

:: Mensagem de conclus�o
echo Listagem conclu�da. O arquivo foi salvo em %ARQUIVO_SAIDA%