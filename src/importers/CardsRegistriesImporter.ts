import Importer from './Importer';
import CardsImporter from './CardsImporter';
import CategoriesImporter from './CategoriesImporter';

import { Collections } from '../data/firebase/Collections';
import CreditCardRegistry from '../data/models/CreditCardRegistry';

import {DespesasDeCartao, DespesasDeCartaoFile} from '../converter/result/xlsx/despesas_de_cartao';

export default class CardsRegistriesImporter extends Importer<CreditCardRegistry, DespesasDeCartao> {

  constructor(
    private cards: CardsImporter,
    private categorias: CategoriesImporter,
    db: FirebaseFirestore.Firestore,
    userPath: string
  ) {
    super(db, db
      .collection(userPath + Collections.CreditCardRegistries)
      .withConverter<CreditCardRegistry>(CreditCardRegistry.firestoreConverter as any)
    );
  }

  async process(): Promise<void> {
    await this.loadExistentes();
    const data = this.readJsonFile(DespesasDeCartaoFile);

    const batch = this.db.batch();

    let equals = 0;
    data.forEach((json, idx) => {
      const docRef = this.collection.doc();

      const card = this.cards.findByName(json.cartao);
      if (!card?.id) {
        console.error(`Cartão ${json.cartao} não encontrado.`);
        return;
      }
      const categoria = this.categorias.findByName(json.categoria, json.sub_categoria);
      if (!categoria?.id) {
        console.error(`Categoria ${json.categoria} > ${json.sub_categoria} não encontrada.`);
        return;
      }

      const registro = new CreditCardRegistry(
        docRef.id,
        card.id,
        json.valor,
        json.descricao,
        json.mes, json.ano, new Date(json.data_despesa),
        json.tags?.split(',').map(tag => tag.trim()) ?? [],
        categoria.id,
        json.observacao?.toString(),
        json.id?.toString()
      );

      if (this.alreadyExists(registro) > 0) {
        equals++;
        return;
      }

      this.items[docRef.id] = registro;
      batch.set(docRef, registro);
    });
    await batch.commit();

    this.sumAndPrint();
    console.log(`Registros iguais encontrados: ${equals} de ${data.length}`);
    console.log('Importação de despesas de cartão finalizada.', Object.keys(this.items).length);
  }

  protected alreadyExists(registro: CreditCardRegistry): number {
    return Object.values(this.items).filter(item =>
      item.cardId === registro.cardId &&
      item.value === registro.value &&
      item.description === registro.description &&
      item.month === registro.month &&
      item.year === registro.year &&
      item.categoryId === registro.categoryId &&
      item.date.getTime() === registro.date.getTime() &&
      item.importInfo === registro.importInfo
    ).length;
  }

  private sumAndPrint() {
    const total = Object.values(this.items).reduce((acc, item) => acc + item.value, 0);
    console.log('Total de despesas de cartão:', total);
    const totalPorCartao = Object.values(this.items).reduce((acc, item) => {
      const card = this.cards.findNameById(item.cardId);
      if (!acc[card]) {
        acc[card] = 0;
      }
      acc[card] += item.value;
      return acc;
    }, {} as any);
    console.log('Total por cartão:', totalPorCartao);
  }
}
