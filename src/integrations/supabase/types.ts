export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      adiantamentos: {
        Row: {
          brindeseextrasadiantamento: number | null
          brindeseextraspagospara: string | null
          created_at: string | null
          datapartida: string | null
          destino: string | null
          hospedagemadiantamento: number | null
          hospedagempagapara: string | null
          id: string
          idviagem: string
          motoristasadiantamento: number | null
          motoristaspagospara: string | null
          outrasdespesasadiantamento: number | null
          outrasdespesaspagaspara: string | null
          passeiosadiantamento: number | null
          passeiospagospara: string | null
          sorteiosadiantamento: number | null
          sorteiospagospara: string | null
          taxasadiantamento: number | null
          taxaspagaspara: string | null
          totaldespesasbrindeseextras: number | null
          totaldespesashospedagem: number | null
          totaldespesasmotoristas: number | null
          totaldespesaspasseios: number | null
          totaldespesassorteios: number | null
          totaldespesastaxas: number | null
          totaldespesastransporte: number | null
          totaldespesastraslados: number | null
          totaloutrasdespesas: number | null
          transporteadiantamento: number | null
          transportepagopara: string | null
          trasladosadiantamento: number | null
          trasladospagospara: string | null
          updated_at: string | null
        }
        Insert: {
          brindeseextrasadiantamento?: number | null
          brindeseextraspagospara?: string | null
          created_at?: string | null
          datapartida?: string | null
          destino?: string | null
          hospedagemadiantamento?: number | null
          hospedagempagapara?: string | null
          id: string
          idviagem: string
          motoristasadiantamento?: number | null
          motoristaspagospara?: string | null
          outrasdespesasadiantamento?: number | null
          outrasdespesaspagaspara?: string | null
          passeiosadiantamento?: number | null
          passeiospagospara?: string | null
          sorteiosadiantamento?: number | null
          sorteiospagospara?: string | null
          taxasadiantamento?: number | null
          taxaspagaspara?: string | null
          totaldespesasbrindeseextras?: number | null
          totaldespesashospedagem?: number | null
          totaldespesasmotoristas?: number | null
          totaldespesaspasseios?: number | null
          totaldespesassorteios?: number | null
          totaldespesastaxas?: number | null
          totaldespesastransporte?: number | null
          totaldespesastraslados?: number | null
          totaloutrasdespesas?: number | null
          transporteadiantamento?: number | null
          transportepagopara?: string | null
          trasladosadiantamento?: number | null
          trasladospagospara?: string | null
          updated_at?: string | null
        }
        Update: {
          brindeseextrasadiantamento?: number | null
          brindeseextraspagospara?: string | null
          created_at?: string | null
          datapartida?: string | null
          destino?: string | null
          hospedagemadiantamento?: number | null
          hospedagempagapara?: string | null
          id?: string
          idviagem?: string
          motoristasadiantamento?: number | null
          motoristaspagospara?: string | null
          outrasdespesasadiantamento?: number | null
          outrasdespesaspagaspara?: string | null
          passeiosadiantamento?: number | null
          passeiospagospara?: string | null
          sorteiosadiantamento?: number | null
          sorteiospagospara?: string | null
          taxasadiantamento?: number | null
          taxaspagaspara?: string | null
          totaldespesasbrindeseextras?: number | null
          totaldespesashospedagem?: number | null
          totaldespesasmotoristas?: number | null
          totaldespesaspasseios?: number | null
          totaldespesassorteios?: number | null
          totaldespesastaxas?: number | null
          totaldespesastransporte?: number | null
          totaldespesastraslados?: number | null
          totaloutrasdespesas?: number | null
          transporteadiantamento?: number | null
          transportepagopara?: string | null
          trasladosadiantamento?: number | null
          trasladospagospara?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adiantamentos_idviagem_fkey"
            columns: ["idviagem"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          bairro: string
          cidade: string
          cpf: string
          created_at: string | null
          datanascimento: string | null
          enderecoembarque: string | null
          id: string
          indicadopor: string | null
          localembarque: string | null
          nome: string
          nomeindicadopor: string | null
          observacoes: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bairro: string
          cidade: string
          cpf: string
          created_at?: string | null
          datanascimento?: string | null
          enderecoembarque?: string | null
          id?: string
          indicadopor?: string | null
          localembarque?: string | null
          nome: string
          nomeindicadopor?: string | null
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bairro?: string
          cidade?: string
          cpf?: string
          created_at?: string | null
          datanascimento?: string | null
          enderecoembarque?: string | null
          id?: string
          indicadopor?: string | null
          localembarque?: string | null
          nome?: string
          nomeindicadopor?: string | null
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fornecedores: {
        Row: {
          ativo: boolean | null
          brindes: boolean | null
          carro: boolean | null
          casa: boolean | null
          chacara: boolean | null
          cidade: string
          estacionamentos: boolean | null
          estado: string
          fretamento: boolean | null
          guias: boolean | null
          hospedagem: boolean | null
          hostel: boolean | null
          hotel: boolean | null
          id: number
          ingressos: boolean | null
          local_id: number | null
          microonibus: boolean | null
          nome_contato: string | null
          nome_fornecedor: string
          observacoes: string | null
          onibus: boolean | null
          passeios: boolean | null
          pousada: boolean | null
          semi_leito: boolean | null
          telefone: string | null
          tipohospedagem: string | null
          van: boolean | null
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean | null
          brindes?: boolean | null
          carro?: boolean | null
          casa?: boolean | null
          chacara?: boolean | null
          cidade: string
          estacionamentos?: boolean | null
          estado: string
          fretamento?: boolean | null
          guias?: boolean | null
          hospedagem?: boolean | null
          hostel?: boolean | null
          hotel?: boolean | null
          id?: number
          ingressos?: boolean | null
          local_id?: number | null
          microonibus?: boolean | null
          nome_contato?: string | null
          nome_fornecedor: string
          observacoes?: string | null
          onibus?: boolean | null
          passeios?: boolean | null
          pousada?: boolean | null
          semi_leito?: boolean | null
          telefone?: string | null
          tipohospedagem?: string | null
          van?: boolean | null
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean | null
          brindes?: boolean | null
          carro?: boolean | null
          casa?: boolean | null
          chacara?: boolean | null
          cidade?: string
          estacionamentos?: boolean | null
          estado?: string
          fretamento?: boolean | null
          guias?: boolean | null
          hospedagem?: boolean | null
          hostel?: boolean | null
          hotel?: boolean | null
          id?: number
          ingressos?: boolean | null
          local_id?: number | null
          microonibus?: boolean | null
          nome_contato?: string | null
          nome_fornecedor?: string
          observacoes?: string | null
          onibus?: boolean | null
          passeios?: boolean | null
          pousada?: boolean | null
          semi_leito?: boolean | null
          telefone?: string | null
          tipohospedagem?: string | null
          van?: boolean | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      horariosembarques: {
        Row: {
          created_at: string | null
          enderecoembarque: string | null
          guiaresponsavel: string | null
          horario: string | null
          horarioida: string | null
          horariovolta: string | null
          id: string
          idviagem: string
          linkimagem: string | null
          localembarque: string
          viagem: string | null
        }
        Insert: {
          created_at?: string | null
          enderecoembarque?: string | null
          guiaresponsavel?: string | null
          horario?: string | null
          horarioida?: string | null
          horariovolta?: string | null
          id?: string
          idviagem: string
          linkimagem?: string | null
          localembarque: string
          viagem?: string | null
        }
        Update: {
          created_at?: string | null
          enderecoembarque?: string | null
          guiaresponsavel?: string | null
          horario?: string | null
          horarioida?: string | null
          horariovolta?: string | null
          id?: string
          idviagem?: string
          linkimagem?: string | null
          localembarque?: string
          viagem?: string | null
        }
        Relationships: []
      }
      locais_embarque: {
        Row: {
          ativo: boolean | null
          cidade: string | null
          created_at: string | null
          enderecoembarque: string
          id: string
          localembarque: string
        }
        Insert: {
          ativo?: boolean | null
          cidade?: string | null
          created_at?: string | null
          enderecoembarque: string
          id?: string
          localembarque: string
        }
        Update: {
          ativo?: boolean | null
          cidade?: string | null
          created_at?: string | null
          enderecoembarque?: string
          id?: string
          localembarque?: string
        }
        Relationships: []
      }
      orcamentos: {
        Row: {
          city_tour: string | null
          company_name: string
          created_at: string | null
          departure_date: string
          departure_time: string
          destination_city: string
          destination_state: string
          group_profile: string
          has_air_conditioning: boolean | null
          has_audio_video: boolean | null
          has_bathroom: boolean | null
          has_minibar: boolean | null
          has_passenger_insurance: boolean | null
          has_wifi: boolean | null
          id: number
          id_viagem: string
          is_customized: boolean | null
          metro_vila_prudente: boolean | null
          need_extra_drivers: boolean | null
          passenger_count: number
          return_date: string
          return_time: string
          terminal_barra_funda: boolean | null
          terminal_campinas: boolean | null
          terminal_osasco: boolean | null
          terminal_tiete: boolean | null
          updated_at: string | null
          vehicle_type: string
        }
        Insert: {
          city_tour?: string | null
          company_name: string
          created_at?: string | null
          departure_date: string
          departure_time: string
          destination_city: string
          destination_state: string
          group_profile: string
          has_air_conditioning?: boolean | null
          has_audio_video?: boolean | null
          has_bathroom?: boolean | null
          has_minibar?: boolean | null
          has_passenger_insurance?: boolean | null
          has_wifi?: boolean | null
          id?: number
          id_viagem: string
          is_customized?: boolean | null
          metro_vila_prudente?: boolean | null
          need_extra_drivers?: boolean | null
          passenger_count: number
          return_date: string
          return_time: string
          terminal_barra_funda?: boolean | null
          terminal_campinas?: boolean | null
          terminal_osasco?: boolean | null
          terminal_tiete?: boolean | null
          updated_at?: string | null
          vehicle_type: string
        }
        Update: {
          city_tour?: string | null
          company_name?: string
          created_at?: string | null
          departure_date?: string
          departure_time?: string
          destination_city?: string
          destination_state?: string
          group_profile?: string
          has_air_conditioning?: boolean | null
          has_audio_video?: boolean | null
          has_bathroom?: boolean | null
          has_minibar?: boolean | null
          has_passenger_insurance?: boolean | null
          has_wifi?: boolean | null
          id?: number
          id_viagem?: string
          is_customized?: boolean | null
          metro_vila_prudente?: boolean | null
          need_extra_drivers?: boolean | null
          passenger_count?: number
          return_date?: string
          return_time?: string
          terminal_barra_funda?: boolean | null
          terminal_campinas?: boolean | null
          terminal_osasco?: boolean | null
          terminal_tiete?: boolean | null
          updated_at?: string | null
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_id_viagem_fkey"
            columns: ["id_viagem"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      passageiros: {
        Row: {
          bairropassageiro: string | null
          cidadepassageiro: string | null
          comissaodivulgacao: number | null
          comissaodivulgacaovalor: number | null
          cpfindicador: string | null
          cpfpassageiro: string
          created_at: string | null
          datapagamentoavista: string | null
          dataparcela10: string | null
          dataparcela2: string | null
          dataparcela3: string | null
          dataparcela4: string | null
          dataparcela5: string | null
          dataparcela6: string | null
          dataparcela7: string | null
          dataparcela8: string | null
          dataparcela9: string | null
          datapartida: string
          datasinal: string | null
          descontoindicacoes: number | null
          descontopromocional: number | null
          destino: string | null
          elegiveldesconto: string
          enderecoembarquepassageiro: string | null
          formapagamentoavista: string | null
          id: string
          idviagem: string | null
          localembarquepassageiro: string | null
          nomepassageiro: string
          nomeviagem: string
          observacoesparcela10: string | null
          observacoesparcela2: string | null
          observacoesparcela3: string | null
          observacoesparcela4: string | null
          observacoesparcela5: string | null
          observacoesparcela6: string | null
          observacoesparcela7: string | null
          observacoesparcela8: string | null
          observacoesparcela9: string | null
          pagamentoavista: boolean | null
          passageiroindicadopor: string | null
          passageiroobservacao: string | null
          poltrona: number | null
          telefonepassageiro: string | null
          updated_at: string | null
          valorfaltareceber: number | null
          valorparcela10: number | null
          valorparcela2: number | null
          valorparcela3: number | null
          valorparcela4: number | null
          valorparcela5: number | null
          valorparcela6: number | null
          valorparcela7: number | null
          valorparcela8: number | null
          valorparcela9: number | null
          valorsinal: number | null
          valortotalpago: number | null
          valorviagem: number
        }
        Insert: {
          bairropassageiro?: string | null
          cidadepassageiro?: string | null
          comissaodivulgacao?: number | null
          comissaodivulgacaovalor?: number | null
          cpfindicador?: string | null
          cpfpassageiro: string
          created_at?: string | null
          datapagamentoavista?: string | null
          dataparcela10?: string | null
          dataparcela2?: string | null
          dataparcela3?: string | null
          dataparcela4?: string | null
          dataparcela5?: string | null
          dataparcela6?: string | null
          dataparcela7?: string | null
          dataparcela8?: string | null
          dataparcela9?: string | null
          datapartida: string
          datasinal?: string | null
          descontoindicacoes?: number | null
          descontopromocional?: number | null
          destino?: string | null
          elegiveldesconto?: string
          enderecoembarquepassageiro?: string | null
          formapagamentoavista?: string | null
          id?: string
          idviagem?: string | null
          localembarquepassageiro?: string | null
          nomepassageiro: string
          nomeviagem: string
          observacoesparcela10?: string | null
          observacoesparcela2?: string | null
          observacoesparcela3?: string | null
          observacoesparcela4?: string | null
          observacoesparcela5?: string | null
          observacoesparcela6?: string | null
          observacoesparcela7?: string | null
          observacoesparcela8?: string | null
          observacoesparcela9?: string | null
          pagamentoavista?: boolean | null
          passageiroindicadopor?: string | null
          passageiroobservacao?: string | null
          poltrona?: number | null
          telefonepassageiro?: string | null
          updated_at?: string | null
          valorfaltareceber?: number | null
          valorparcela10?: number | null
          valorparcela2?: number | null
          valorparcela3?: number | null
          valorparcela4?: number | null
          valorparcela5?: number | null
          valorparcela6?: number | null
          valorparcela7?: number | null
          valorparcela8?: number | null
          valorparcela9?: number | null
          valorsinal?: number | null
          valortotalpago?: number | null
          valorviagem: number
        }
        Update: {
          bairropassageiro?: string | null
          cidadepassageiro?: string | null
          comissaodivulgacao?: number | null
          comissaodivulgacaovalor?: number | null
          cpfindicador?: string | null
          cpfpassageiro?: string
          created_at?: string | null
          datapagamentoavista?: string | null
          dataparcela10?: string | null
          dataparcela2?: string | null
          dataparcela3?: string | null
          dataparcela4?: string | null
          dataparcela5?: string | null
          dataparcela6?: string | null
          dataparcela7?: string | null
          dataparcela8?: string | null
          dataparcela9?: string | null
          datapartida?: string
          datasinal?: string | null
          descontoindicacoes?: number | null
          descontopromocional?: number | null
          destino?: string | null
          elegiveldesconto?: string
          enderecoembarquepassageiro?: string | null
          formapagamentoavista?: string | null
          id?: string
          idviagem?: string | null
          localembarquepassageiro?: string | null
          nomepassageiro?: string
          nomeviagem?: string
          observacoesparcela10?: string | null
          observacoesparcela2?: string | null
          observacoesparcela3?: string | null
          observacoesparcela4?: string | null
          observacoesparcela5?: string | null
          observacoesparcela6?: string | null
          observacoesparcela7?: string | null
          observacoesparcela8?: string | null
          observacoesparcela9?: string | null
          pagamentoavista?: boolean | null
          passageiroindicadopor?: string | null
          passageiroobservacao?: string | null
          poltrona?: number | null
          telefonepassageiro?: string | null
          updated_at?: string | null
          valorfaltareceber?: number | null
          valorparcela10?: number | null
          valorparcela2?: number | null
          valorparcela3?: number | null
          valorparcela4?: number | null
          valorparcela5?: number | null
          valorparcela6?: number | null
          valorparcela7?: number | null
          valorparcela8?: number | null
          valorparcela9?: number | null
          valorsinal?: number | null
          valortotalpago?: number | null
          valorviagem?: number
        }
        Relationships: [
          {
            foreignKeyName: "passageiros_idviagem_fkey"
            columns: ["idviagem"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_log: {
        Row: {
          created_at: string
          email: string
          error_message: string | null
          id: string
          nome: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          nome: string
          status: string
        }
        Update: {
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          nome?: string
          status?: string
        }
        Relationships: []
      }
      pedidosdeacesso: {
        Row: {
          created_at: string | null
          email: string
          id: string
          motivo: string | null
          nome: string
          observacoes: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          motivo?: string | null
          nome: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          motivo?: string | null
          nome?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidosdeacesso_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          created_at: string | null
          email: string
          funcao: string
          id: string
          nome: string
          password_hash: string | null
          role: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          funcao?: string
          id?: string
          nome: string
          password_hash?: string | null
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          funcao?: string
          id?: string
          nome?: string
          password_hash?: string | null
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      viagens: {
        Row: {
          adiantamentobrindes: number | null
          adiantamentodespesasdiversas: number | null
          adiantamentohospedagem: number | null
          adiantamentomotoristas: number | null
          adiantamentopasseios: number | null
          adiantamentosorteios: number | null
          adiantamentotaxas: number | null
          adiantamentotransporte: number | null
          adiantamentotraslados: number | null
          brindesdescricao: string | null
          brindeseextrasobservacao: string | null
          brindestotal: number | null
          brindesunitario: number | null
          cidadehospedagem: string | null
          cidadesvisitar: string | null
          cidadetransporte: string | null
          comissaodivulgacao: number | null
          comissaodivulgacaovalor: number | null
          comissaomaxdivulgacao: number | null
          contatohospedagem: string | null
          contatotransporte: string | null
          created_at: string | null
          datapartida: string
          dataretorno: string
          descontoindicacoes: number | null
          descontosindicacoes: number | null
          descontospromocionais: number | null
          descricaopasseios1: string | null
          descricaopasseios2: string | null
          descricaopasseios3: string | null
          deslocamentomotoristaunitario: number | null
          despesasdiversas: number | null
          despesasdiversasobservacao: string | null
          despesatotal: number | null
          despesatotalreal: number | null
          destino: string
          empresahospedagem: string | null
          empresatransporte: string | null
          estacionamento: number | null
          extras1descricao: string | null
          extras1valor: number | null
          extras2descricao: string | null
          extras2valor: number | null
          extras3descricao: string | null
          extras3valor: number | null
          frete: number
          hospedagemobservacao: string | null
          id: string
          lucrobruto: number | null
          lucrobrutoreal: number | null
          lucroliquido: number | null
          lucroliquidoreal: number | null
          margemdesejada: number | null
          motoristasobservacao: string | null
          naovendidos: number
          nomeguia: string | null
          nomeguialocal: string
          observacoesreal: string | null
          outrasreceitasdescricao: string | null
          outrasreceitasvalor: number | null
          outrastaxasvalor: number | null
          outrosservicosdescricao: string | null
          outrosservicosvalor: number | null
          passeiosobservacao: string | null
          pontoequilibrio: number | null
          precodefinido: number | null
          precosugerido: number
          qtdealmocosmotoristas: number | null
          qtdeassentos: number | null
          qtdebrindes: number | null
          qtdedeslocamentosmotoristas: number | null
          qtdediarias: number | null
          qtdehospedes: number | null
          qtdejantasmotoristas: number | null
          qtdemotoristas: number | null
          qtdenaopagantes: number | null
          qtdepagantes: number | null
          qtdepagantesminimo: number | null
          qtdepagantesreal: number | null
          qtdepagantesresultados: number | null
          qtdepasseios1: number | null
          qtdepasseios2: number | null
          qtdepasseios3: number | null
          qtdepromocionais: number | null
          qtdereservadosguias: number | null
          qtdetraslado1: number | null
          qtdetraslado2: number | null
          qtdetraslado3: number | null
          receitabruta: number | null
          receitatotal: number | null
          receitatotalreal: number | null
          refeicaomotoristaunitario: number | null
          regimehospedagem: string | null
          resultadobruto: number | null
          resultadoliquido: number | null
          resultadosobservacao: string | null
          sorteio1descricao: string | null
          sorteio1qtde: number | null
          sorteio1valor: number | null
          sorteio2descricao: string | null
          sorteio2qtde: number | null
          sorteio2valor: number | null
          sorteio3descricao: string | null
          sorteio3qtde: number | null
          sorteio3valor: number | null
          sorteiosobservacao: string | null
          taxacidade: number | null
          taxaguialocal: number | null
          taxasobservacao: string | null
          tipohospedagem: string | null
          tipoveiculo: string
          totaldescontosreal: number | null
          totaldeslocamentosmotoristas: number | null
          totaldespesasbrindeesextras: number | null
          totaldespesashospedagem: number | null
          totaldespesasmotoristas: number | null
          totaldespesaspasseios: number | null
          totaldespesassorteios: number | null
          totaldespesastaxas: number | null
          totaldespesastraslados: number | null
          totaldiarias: number | null
          totalindicacoesreal: number | null
          totaloutrasreceitas: number | null
          totalrefeicaomotorista: number | null
          transporteobservacao: string | null
          traslado1descricao: string | null
          traslado1valor: number | null
          traslado2descricao: string | null
          traslado2valor: number | null
          traslado3descricao: string | null
          traslado3valor: number | null
          trasladosobservacao: string | null
          updated_at: string | null
          valordiariaunitario: number | null
          valorpasseios1: number | null
          valorpasseios2: number | null
          valorpasseios3: number | null
          whatsappguia: string | null
          whatsappguialocal: string | null
          whatsapphospedagem: string | null
          whatsapptransporte: string | null
        }
        Insert: {
          adiantamentobrindes?: number | null
          adiantamentodespesasdiversas?: number | null
          adiantamentohospedagem?: number | null
          adiantamentomotoristas?: number | null
          adiantamentopasseios?: number | null
          adiantamentosorteios?: number | null
          adiantamentotaxas?: number | null
          adiantamentotransporte?: number | null
          adiantamentotraslados?: number | null
          brindesdescricao?: string | null
          brindeseextrasobservacao?: string | null
          brindestotal?: number | null
          brindesunitario?: number | null
          cidadehospedagem?: string | null
          cidadesvisitar?: string | null
          cidadetransporte?: string | null
          comissaodivulgacao?: number | null
          comissaodivulgacaovalor?: number | null
          comissaomaxdivulgacao?: number | null
          contatohospedagem?: string | null
          contatotransporte?: string | null
          created_at?: string | null
          datapartida: string
          dataretorno: string
          descontoindicacoes?: number | null
          descontosindicacoes?: number | null
          descontospromocionais?: number | null
          descricaopasseios1?: string | null
          descricaopasseios2?: string | null
          descricaopasseios3?: string | null
          deslocamentomotoristaunitario?: number | null
          despesasdiversas?: number | null
          despesasdiversasobservacao?: string | null
          despesatotal?: number | null
          despesatotalreal?: number | null
          destino: string
          empresahospedagem?: string | null
          empresatransporte?: string | null
          estacionamento?: number | null
          extras1descricao?: string | null
          extras1valor?: number | null
          extras2descricao?: string | null
          extras2valor?: number | null
          extras3descricao?: string | null
          extras3valor?: number | null
          frete?: number
          hospedagemobservacao?: string | null
          id?: string
          lucrobruto?: number | null
          lucrobrutoreal?: number | null
          lucroliquido?: number | null
          lucroliquidoreal?: number | null
          margemdesejada?: number | null
          motoristasobservacao?: string | null
          naovendidos?: number
          nomeguia?: string | null
          nomeguialocal?: string
          observacoesreal?: string | null
          outrasreceitasdescricao?: string | null
          outrasreceitasvalor?: number | null
          outrastaxasvalor?: number | null
          outrosservicosdescricao?: string | null
          outrosservicosvalor?: number | null
          passeiosobservacao?: string | null
          pontoequilibrio?: number | null
          precodefinido?: number | null
          precosugerido?: number
          qtdealmocosmotoristas?: number | null
          qtdeassentos?: number | null
          qtdebrindes?: number | null
          qtdedeslocamentosmotoristas?: number | null
          qtdediarias?: number | null
          qtdehospedes?: number | null
          qtdejantasmotoristas?: number | null
          qtdemotoristas?: number | null
          qtdenaopagantes?: number | null
          qtdepagantes?: number | null
          qtdepagantesminimo?: number | null
          qtdepagantesreal?: number | null
          qtdepagantesresultados?: number | null
          qtdepasseios1?: number | null
          qtdepasseios2?: number | null
          qtdepasseios3?: number | null
          qtdepromocionais?: number | null
          qtdereservadosguias?: number | null
          qtdetraslado1?: number | null
          qtdetraslado2?: number | null
          qtdetraslado3?: number | null
          receitabruta?: number | null
          receitatotal?: number | null
          receitatotalreal?: number | null
          refeicaomotoristaunitario?: number | null
          regimehospedagem?: string | null
          resultadobruto?: number | null
          resultadoliquido?: number | null
          resultadosobservacao?: string | null
          sorteio1descricao?: string | null
          sorteio1qtde?: number | null
          sorteio1valor?: number | null
          sorteio2descricao?: string | null
          sorteio2qtde?: number | null
          sorteio2valor?: number | null
          sorteio3descricao?: string | null
          sorteio3qtde?: number | null
          sorteio3valor?: number | null
          sorteiosobservacao?: string | null
          taxacidade?: number | null
          taxaguialocal?: number | null
          taxasobservacao?: string | null
          tipohospedagem?: string | null
          tipoveiculo: string
          totaldescontosreal?: number | null
          totaldeslocamentosmotoristas?: number | null
          totaldespesasbrindeesextras?: number | null
          totaldespesashospedagem?: number | null
          totaldespesasmotoristas?: number | null
          totaldespesaspasseios?: number | null
          totaldespesassorteios?: number | null
          totaldespesastaxas?: number | null
          totaldespesastraslados?: number | null
          totaldiarias?: number | null
          totalindicacoesreal?: number | null
          totaloutrasreceitas?: number | null
          totalrefeicaomotorista?: number | null
          transporteobservacao?: string | null
          traslado1descricao?: string | null
          traslado1valor?: number | null
          traslado2descricao?: string | null
          traslado2valor?: number | null
          traslado3descricao?: string | null
          traslado3valor?: number | null
          trasladosobservacao?: string | null
          updated_at?: string | null
          valordiariaunitario?: number | null
          valorpasseios1?: number | null
          valorpasseios2?: number | null
          valorpasseios3?: number | null
          whatsappguia?: string | null
          whatsappguialocal?: string | null
          whatsapphospedagem?: string | null
          whatsapptransporte?: string | null
        }
        Update: {
          adiantamentobrindes?: number | null
          adiantamentodespesasdiversas?: number | null
          adiantamentohospedagem?: number | null
          adiantamentomotoristas?: number | null
          adiantamentopasseios?: number | null
          adiantamentosorteios?: number | null
          adiantamentotaxas?: number | null
          adiantamentotransporte?: number | null
          adiantamentotraslados?: number | null
          brindesdescricao?: string | null
          brindeseextrasobservacao?: string | null
          brindestotal?: number | null
          brindesunitario?: number | null
          cidadehospedagem?: string | null
          cidadesvisitar?: string | null
          cidadetransporte?: string | null
          comissaodivulgacao?: number | null
          comissaodivulgacaovalor?: number | null
          comissaomaxdivulgacao?: number | null
          contatohospedagem?: string | null
          contatotransporte?: string | null
          created_at?: string | null
          datapartida?: string
          dataretorno?: string
          descontoindicacoes?: number | null
          descontosindicacoes?: number | null
          descontospromocionais?: number | null
          descricaopasseios1?: string | null
          descricaopasseios2?: string | null
          descricaopasseios3?: string | null
          deslocamentomotoristaunitario?: number | null
          despesasdiversas?: number | null
          despesasdiversasobservacao?: string | null
          despesatotal?: number | null
          despesatotalreal?: number | null
          destino?: string
          empresahospedagem?: string | null
          empresatransporte?: string | null
          estacionamento?: number | null
          extras1descricao?: string | null
          extras1valor?: number | null
          extras2descricao?: string | null
          extras2valor?: number | null
          extras3descricao?: string | null
          extras3valor?: number | null
          frete?: number
          hospedagemobservacao?: string | null
          id?: string
          lucrobruto?: number | null
          lucrobrutoreal?: number | null
          lucroliquido?: number | null
          lucroliquidoreal?: number | null
          margemdesejada?: number | null
          motoristasobservacao?: string | null
          naovendidos?: number
          nomeguia?: string | null
          nomeguialocal?: string
          observacoesreal?: string | null
          outrasreceitasdescricao?: string | null
          outrasreceitasvalor?: number | null
          outrastaxasvalor?: number | null
          outrosservicosdescricao?: string | null
          outrosservicosvalor?: number | null
          passeiosobservacao?: string | null
          pontoequilibrio?: number | null
          precodefinido?: number | null
          precosugerido?: number
          qtdealmocosmotoristas?: number | null
          qtdeassentos?: number | null
          qtdebrindes?: number | null
          qtdedeslocamentosmotoristas?: number | null
          qtdediarias?: number | null
          qtdehospedes?: number | null
          qtdejantasmotoristas?: number | null
          qtdemotoristas?: number | null
          qtdenaopagantes?: number | null
          qtdepagantes?: number | null
          qtdepagantesminimo?: number | null
          qtdepagantesreal?: number | null
          qtdepagantesresultados?: number | null
          qtdepasseios1?: number | null
          qtdepasseios2?: number | null
          qtdepasseios3?: number | null
          qtdepromocionais?: number | null
          qtdereservadosguias?: number | null
          qtdetraslado1?: number | null
          qtdetraslado2?: number | null
          qtdetraslado3?: number | null
          receitabruta?: number | null
          receitatotal?: number | null
          receitatotalreal?: number | null
          refeicaomotoristaunitario?: number | null
          regimehospedagem?: string | null
          resultadobruto?: number | null
          resultadoliquido?: number | null
          resultadosobservacao?: string | null
          sorteio1descricao?: string | null
          sorteio1qtde?: number | null
          sorteio1valor?: number | null
          sorteio2descricao?: string | null
          sorteio2qtde?: number | null
          sorteio2valor?: number | null
          sorteio3descricao?: string | null
          sorteio3qtde?: number | null
          sorteio3valor?: number | null
          sorteiosobservacao?: string | null
          taxacidade?: number | null
          taxaguialocal?: number | null
          taxasobservacao?: string | null
          tipohospedagem?: string | null
          tipoveiculo?: string
          totaldescontosreal?: number | null
          totaldeslocamentosmotoristas?: number | null
          totaldespesasbrindeesextras?: number | null
          totaldespesashospedagem?: number | null
          totaldespesasmotoristas?: number | null
          totaldespesaspasseios?: number | null
          totaldespesassorteios?: number | null
          totaldespesastaxas?: number | null
          totaldespesastraslados?: number | null
          totaldiarias?: number | null
          totalindicacoesreal?: number | null
          totaloutrasreceitas?: number | null
          totalrefeicaomotorista?: number | null
          transporteobservacao?: string | null
          traslado1descricao?: string | null
          traslado1valor?: number | null
          traslado2descricao?: string | null
          traslado2valor?: number | null
          traslado3descricao?: string | null
          traslado3valor?: number | null
          trasladosobservacao?: string | null
          updated_at?: string | null
          valordiariaunitario?: number | null
          valorpasseios1?: number | null
          valorpasseios2?: number | null
          valorpasseios3?: number | null
          whatsappguia?: string | null
          whatsappguialocal?: string | null
          whatsapphospedagem?: string | null
          whatsapptransporte?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_comissaodivulgacaovalor_column: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_user_role: {
        Args: { required_role: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin_or_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_not_super_admin: {
        Args: { target_id: string }
        Returns: boolean
      }
      update_comissaodivulgacaovalor_default: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
