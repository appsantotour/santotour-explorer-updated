


export interface ClientFormData {
  id?: string; // Optional: for existing records
  cpf: string;
  nome: string;
  telefone?: string | null; // Nullable
  datanascimento?: string | null; // Nullable, will be YYYY-MM-DD for Supabase
  bairro: string;
  cidade: string;
  localembarque?: string | null; // Nullable
  enderecoembarque?: string | null; // Nullable
  indicadopor?: string | null; // Nullable
  nomeindicadopor?: string | null; // Nullable
  observacoes?: string | null; // Nullable
}

export type FormFieldName = keyof ClientFormData; 

export type MaskType = 'cpf' | 'phone' | 'date' | 'integer' | 'currency';

export interface ViagensFormData {
  id?: string; 
  // Informações Gerais
  destino: string;
  cidadesvisitar?: string; 
  datapartida: string; 
  dataretorno: string; 

  // Seção TAXAS 
  taxacidade?: string; 
  outrastaxasvalor?: string;
  estacionamento?: string;
  taxaguialocal?: string;
  nomeguia?: string; 
  whatsappguia?: string;
  nomeguialocal?: string;
  whatsappguialocal?: string; 
  totaldespesastaxas?: string; 
  adiantamentotaxas?: string; 
  taxasobservacao?: string;

  // Seção TRANSPORTE
  cidadetransporte?: string; 
  empresatransporte?: string; // Will store the ID of the selected 'fornecedor'
  contatotransporte?: string; // Auto-filled from selected 'fornecedor'
  whatsapptransporte?: string; // Auto-filled and masked from selected 'fornecedor'
  tipoveiculo?: string; // Dynamically populated based on selected 'fornecedor'
  qtdeassentos?: string; // Potentially auto-filled or manual, read-only for now
  qtdereservadosguias?: string;
  qtdepromocionais?: string;
  naovendidos?: string; 
  qtdenaopagantes?: string;
  qtdepagantes?: string; 
  frete?: string; 
  adiantamentotransporte?: string; 
  transporteobservacao?: string;

  // Seção MOTORISTAS
  qtdemotoristas?: string; 
  qtdealmocosmotoristas?: string; 
  qtdejantasmotoristas?: string; 
  refeicaomotoristaunitario?: string; 
  totalrefeicaomotorista?: string; 
  qtdedeslocamentosmotoristas?: string; 
  deslocamentomotoristaunitario?: string; 
  totaldeslocamentosmotoristas?: string; 
  totaldespesasmotoristas?: string; 
  adiantamentomotoristas?: string; 
  motoristasobservacao?: string;

  // Seção TRASLADOS
  qtdetraslado1?: string; 
  traslado1valor?: string;
  traslado1descricao?: string;
  qtdetraslado2?: string; 
  traslado2valor?: string;
  traslado2descricao?: string;
  qtdetraslado3?: string; 
  traslado3valor?: string;
  traslado3descricao?: string;
  totaldespesastraslados?: string; 
  adiantamentotraslados?: string; 
  trasladosobservacao?: string;

  // Seção HOSPEDAGEM
  cidadehospedagem?: string; 
  empresahospedagem?: string; 
  tipohospedagem?: string; 
  regimehospedagem?: string; 
  contatohospedagem?: string;
  whatsapphospedagem?: string; 
  qtdehospedes?: string; 
  qtdediarias?: string; 
  valordiariaunitario?: string; 
  totaldiarias?: string; 
  outrosservicosvalor?: string;
  outrosservicosdescricao?: string;
  totaldespesashospedagem?: string; 
  adiantamentohospedagem?: string; 
  hospedagemobservacao?: string;

  // Seção PASSEIOS E INGRESSOS
  qtdepasseios1?: string; 
  valorpasseios1?: string; 
  descricaopasseios1?: string;
  qtdepasseios2?: string; 
  valorpasseios2?: string; 
  descricaopasseios2?: string;
  qtdepasseios3?: string; 
  valorpasseios3?: string; 
  descricaopasseios3?: string;
  totaldespesaspasseios?: string; 
  adiantamentopasseios?: string; 
  passeiosobservacao?: string;

  // Seção BRINDES E EXTRAS
  qtdebrindes?: string; 
  brindesunitario?: string; 
  brindestotal?: string; // Renamed from totalbrindes
  brindesdescricao?: string;
  extras1valor?: string;
  extras1descricao?: string;
  extras2valor?: string;
  extras2descricao?: string;
  extras3valor?: string;
  extras3descricao?: string;
  totaldespesasbrindeesextras?: string; 
  adiantamentobrindes?: string;
  brindeseextrasobservacao?: string;

  // Seção SORTEIOS
  sorteio1qtde?: string;
  sorteio1valor?: string;
  sorteio1descricao?: string;
  sorteio2qtde?: string;
  sorteio2valor?: string;
  sorteio2descricao?: string;
  sorteio3qtde?: string;
  sorteio3valor?: string;
  sorteio3descricao?: string;
  totaldespesassorteios?: string; 
  adiantamentosorteios?: string; 
  sorteiosobservacao?: string;

  // Seção OUTRAS DESPESAS
  despesasdiversas?: string; 
  adiantamentodespesasdiversas?: string; 
  despesasdiversasobservacao?: string;

  // Seção OUTRAS RECEITAS
  outrasreceitasvalor?: string; 
  outrasreceitasdescricao?: string; 

  // Seção RESULTADOS (ESTIMATIVA)
  qtdepagantesresultados?: string; 
  despesatotal?: string; 
  pontoequilibrio?: string; 
  margemdesejada?: string; 
  precosugerido?: string; // Renamed from campo1
  precodefinido?: string; 
  receitatotal?: string; 
  lucrobruto?: string; 
  comissaodivulgacao?: string; 
  comissaodivulgacaovalor?: string; 
  comissaomaxdivulgacao?: string; 
  lucroliquido?: string; 

  // Seção RESULTADOS (REAL)
  qtdepagantesreal?: string;
  qtdepagantesminimo?: string; 
  despesatotalreal?: string;
  receitatotalreal?: string;
  lucrobrutoreal?: string;
  resultadobruto?: string; // Added this field
  totaldescontosreal?: string;
  totalindicacoesreal?: string;
  lucroliquidoreal?: string;
  observacoesreal?: string;
}

export type ViagensFormFieldName = keyof ViagensFormData;

// Tipos para o novo formulário de Fornecedores
export const EstadoBrasil = [
  { value: '', label: 'Selecione um estado' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PR', label: 'Paraná' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' }
];


export const TipoHospedagemOpcao = [
  { value: '', label: 'Selecione um tipo' },
  { value: 'Pousada', label: 'Pousada' },
  { value: 'Hostel', label: 'Hostel' },
  { value: 'Hotel', label: 'Hotel' },
  { value: 'Chácara', label: 'Chácara' },
  { value: 'Casa', label: 'Casa' },
];

export interface FornecedoresFormData {
  id?: number; // ID do fornecedor, para edição/exclusão
  fornecedor_selecionado_id?: number; // ID usado pelo SelectField para carregar um fornecedor existente
  nome_fornecedor: string;
  nome_contato: string;
  telefone: string;
  whatsapp: string;
  estado: string;
  cidade: string;
  fretamento: boolean;
  onibus: boolean;
  semi_leito: boolean;
  microonibus: boolean;
  van: boolean;
  carro: boolean;
  hospedagem: boolean;
  tipohospedagem: string; // Este campo será usado para salvar o tipo de hospedagem na tabela (se houver coluna)
  // Campos booleanos individuais da tabela (pousada, hotel, etc.) não estão aqui, pois a UI usa um Select 'tipohospedagem'.
  // Se for necessário salvar nesses campos booleanos, será preciso lógica adicional no handleSubmit.
  guias: boolean;
  passeios: boolean;
  ingressos: boolean;
  estacionamentos: boolean;
  brindes: boolean;
  observacoes: string;
  ativo: boolean; // Novo campo para status do fornecedor
}

export type FornecedoresFormFieldName = keyof FornecedoresFormData;

// Tipos para o formulário de Locais de Embarque
export interface LocaisEmbarqueFormData {
  id?: string; // Optional ID for existing records
  localembarque: string;
  enderecoembarque: string;
  cidade: string;
  ativo?: boolean; // true = ativo, false = inativo
}

export type LocaisEmbarqueFormFieldName = keyof LocaisEmbarqueFormData;

// Tipos para o formulário de Passageiros
export interface PassageiroFormData {
  id?: string; // Optional ID for the passenger record itself
  viagemId?: string; 
  nomeviagem?: string;
  datapartida?: string; // Added field for trip departure date
  nomepassageiro: string;
  cpfpassageiro: string;
  telefonepassageiro?: string;
  bairropassageiro?: string;
  cidadepassageiro?: string;
  localembarquepassageiro?: string;
  enderecoembarquepassageiro?: string; 
  cpfindicador?: string; 
  nomeindicador?: string; // This field is for form logic, not for Supabase table
  elegiveldesconto?: boolean; 
  passageiroobservacao?: string; 
  poltrona?: string | null; // Added field for seat number

  valorviagem?: string; 
  valorsinal?: string; 
  datasinal?: string; 
  valorparcela2?: string; 
  dataparcela2?: string; 
  observacoesparcela2?: string; 
  valorparcela3?: string; 
  dataparcela3?: string; 
  observacoesparcela3?: string; 
  valorparcela4?: string; 
  dataparcela4?: string; 
  observacoesparcela4?: string; 
  valorparcela5?: string; 
  dataparcela5?: string; 
  observacoesparcela5?: string; 
  valorparcela6?: string; 
  dataparcela6?: string; 
  observacoesparcela6?: string; 
  valorparcela7?: string; 
  dataparcela7?: string; 
  observacoesparcela7?: string; 
  valorparcela8?: string; 
  dataparcela8?: string; 
  observacoesparcela8?: string; 
  valorparcela9?: string; 
  dataparcela9?: string; 
  observacoesparcela9?: string; 
  valorparcela10?: string; 
  dataparcela10?: string; 
  observacoesparcela10?: string; 
  descontopromocional?: string; 
  descontoindicacoes?: string; 
  valorfaltareceber?: string; 

  // Fields related to boarding list management, primarily for backend.
  // UI for these might be in ListaEmbarque.tsx directly.
  horario_embarque?: string | null; // e.g., "HH:MM:SS" or "HH:MM"
  ordem_embarque?: number | null;
}

export type PassageiroFormFieldName = keyof PassageiroFormData;

// Tipos para o formulário Modelo (Template)
export interface ModeloFormData {
  id?: string; // Optional ID for existing records
  nome: string; // Example field
  descricao?: string; // Example field
}
export type ModeloFormFieldName = keyof ModeloFormData;
