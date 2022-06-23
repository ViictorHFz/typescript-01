import { domInjector } from "../decorators/dom-injection.js";
import { inspect } from "../decorators/inspect.js";
import { logarTempoExecucao } from "../decorators/logar-tempo-de-exec.js";
import { DiasDaSemana } from "../enums/dias-da-semana.js";
import { Negociacao } from "../models/negociacao.js";
import { Negociacoes } from "../models/negociacoes.js";
import { NegociacoesService } from "../services/negociacoes-services.js";
import { imprimir } from "../utils/imprimir.js";
import { MensagemView } from "../views/mensagem-views.js";
import { NegociacoesView } from "../views/negociacoes-view.js";

export class NegociacaoController {
    @domInjector('#data')
    private inputData: HTMLInputElement;
    @domInjector('#quantidade')
    private inputQuantidade: HTMLInputElement;
    @domInjector('#valor')
    private inputValor: HTMLInputElement;
    private negociacoes = new Negociacoes();
    private negociacoesView = new NegociacoesView('#negociacoesView')
    private mensagemView = new MensagemView('#mensagemView');
    private negociacaoService = new NegociacoesService();

    constructor() {
        this.negociacoesView.update(this.negociacoes);
    }

    @inspect
    @logarTempoExecucao()
    public adiciona(): void {
        const negociacao = Negociacao.criaDe(
            this.inputData.value,
            this.inputQuantidade.value,
            this.inputValor.value
        )
        if(!this.ehDiaUtil(negociacao.data)) {
            this.mensagemView.update('Apenas negociações em dias úteis são aceitas!');
            return;
        }

        this.negociacoes.adiciona(negociacao);
        imprimir(negociacao, this.negociacoes)
        this.limpaForm();
        this.atualizaView();
    }

    importaDados(): void {
        this.negociacaoService
            .obterNegociacoesDoDia()
            .then(negociacoesDeHoje => {
                for(let negociacao of negociacoesDeHoje) {
                    this.negociacoes.adiciona(negociacao)
                }
                this.negociacoesView.update(this.negociacoes)
            })
    }

    private ehDiaUtil(data: Date) {
        return data.getDay() > DiasDaSemana.DOMINGO && data.getDay() < DiasDaSemana.SABADO;
    }

    private limpaForm(): void {
        const form = <HTMLFormElement>document.querySelector('form');
        form.reset();
        this.inputData.focus();
    }

    private atualizaView(): void {
        this.negociacoesView.update(this.negociacoes);
        this.mensagemView.update('Negociação adicionada com sucesso!');
    }
}