import { Imagem } from '../../../domain/entities/imagem';
import { TipoDeCargo } from '../../../domain/entities/usuario';
import { ApiError } from '../../../helpers/types/api-error';
import { ImagemRepositorio } from '../../repositories/ImagemRepositorio';
import { UsuarioRepositorio } from '../../repositories/UsuarioRepositorio';

export type CriandoImagemRequisicao = {
	nome: string;
	data: Date;
	endereco: string;
	latitude: string;
	longitude: string;
	idDoUsuario: string;
	criadoEm: Date;
	atualizadoEm: Date;
	eSugestao: boolean;
};

export class CriandoImagem {
	constructor(
		private usuarioRepositorio: UsuarioRepositorio,
		private imagemRepositorio: ImagemRepositorio,
	) {}

	async executar({
		nome,
		data,
		endereco,
		idDoUsuario,
		latitude,
		longitude,
		criadoEm,
		atualizadoEm,
		eSugestao,
	}: CriandoImagemRequisicao) {
		await validacaoDaRequisicao(
			{
				nome,
				data,
				endereco,
				idDoUsuario,
				latitude,
				longitude,
				criadoEm,
				atualizadoEm,
				eSugestao,
			},
			this.usuarioRepositorio,
		);

		const imagem = Imagem.criar(
			{
				nome,
				data,
				endereco,
				idDoUsuario,
				latitude,
				longitude,
				url: 'http://',
				visualizacoes: 0,
				eSugestao,
			},
			criadoEm,
			atualizadoEm,
		);

		await this.imagemRepositorio.create(imagem);

		return imagem;
	}
}

async function validacaoDaRequisicao(
	{
		nome,
		data,
		endereco,
		idDoUsuario,
		latitude,
		longitude,
		criadoEm,
		atualizadoEm,
		eSugestao,
	}: CriandoImagemRequisicao,
	usuarioRepositorio: UsuarioRepositorio,
) {
	const campos = {
		nome,
		data,
		endereco,
		idDoUsuario,
		latitude,
		longitude,
		criadoEm,
		atualizadoEm,
		eSugestao,
	};

	for (const [key, value] of Object.entries(campos)) {
		if (value == null || value === undefined) {
			throw new ApiError(`Campo '${key}' ausente na requisição.`, 400);
		}
	}

	const usuario = await usuarioRepositorio.findById(idDoUsuario);
	if (!usuario) {
		throw new ApiError(`Usuario '${idDoUsuario}' não encontrado.`, 404);
	}

	if (usuario.props.cargo == TipoDeCargo.USUARIO && !eSugestao) {
		throw new ApiError(`Não autorizado.`, 401);
	}
}
