import request from 'supertest';
import express from 'express';
import { postMessages, getMessages } from '../src/controllers/pixController';
import { insertPixMessages, getPixMessages, checkStreamLimit, registerStream, logInteraction } from '../src/services/pixService';
import { formatMessage } from '../src/utils/formatMessage';
import { generateId } from '../src/utils/dataGenerator';
import { PixMessage } from '../src/models/pixMessage';

const app = express();
app.use(express.json());
app.post('/api/messages/:ispb/:number', postMessages);
app.get('/api/pix/:ispb/stream/start', getMessages);

jest.mock('../src/services/pixService');
jest.mock('../src/utils/formatMessage', () => ({
  ...jest.requireActual('../src/utils/formatMessage'),
  formatMessage: jest.fn(),
}));

jest.mock('../src/utils/dataGenerator', () => ({
  generateId: jest.fn(),
}));

const mockInsertPixMessages = insertPixMessages as jest.MockedFunction<typeof insertPixMessages>;
const mockGetPixMessages = getPixMessages as jest.MockedFunction<typeof getPixMessages>;
const mockCheckStreamLimit = checkStreamLimit as jest.MockedFunction<typeof checkStreamLimit>;
const mockRegisterStream = registerStream as jest.MockedFunction<typeof registerStream>;
const mockLogInteraction = logInteraction as jest.MockedFunction<typeof logInteraction>;
const mockFormatMessage = formatMessage as jest.MockedFunction<typeof formatMessage>;
const mockGenerateId = generateId as jest.MockedFunction<typeof generateId>;

describe('postMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 201 and the inserted messages', async () => {
    const ispb = '32074986';
    const number = '5';

    const mockMessages: PixMessage[] = [
      {
        endToEndId: 'd4f951f4cbfc40d6b8b46fdfcb74dd87',
        valor: 100.00,
        pagador: {
          nome: 'Test User 1',
          cpfCnpj: '12345678901',
          ispb: '12345678',
          agencia: '0001',
          contaTransacional: '00012345',
          tipoConta: 'CACC',
        },
        recebedor: {
          nome: 'Test User 2',
          cpfCnpj: '10987654321',
          ispb: '32074986',
          agencia: '0002',
          contaTransacional: '54321000',
          tipoConta: 'SVGS',
        },
        campoLivre: '',
        txId: 'fixed-tx-id-1',
        dataHoraPagamento: '2024-09-02T01:48:27.447Z',
      },
    ];

    mockInsertPixMessages.mockResolvedValue(mockMessages);

    const response = await request(app)
      .post(`/api/messages/${ispb}/${number}`)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toEqual(mockMessages);
    expect(mockInsertPixMessages).toHaveBeenCalledWith(ispb, parseInt(number, 10));
    expect(mockInsertPixMessages).toHaveBeenCalledTimes(1);
  });

  it('should return 400 for invalid number of messages', async () => {
    const ispb = '12345678';
    const invalidNumber = 'invalid';

    const response = await request(app)
      .post(`/api/messages/${ispb}/${invalidNumber}`)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid number of messages' });
  });

  it('should return 500 if insertPixMessages throws an error', async () => {
    const ispb = '12345678';
    const number = '5';

    mockInsertPixMessages.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post(`/api/messages/${ispb}/${number}`)
      .expect('Content-Type', /json/)
      .expect(500);

    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});

describe('getMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and one message when content-type is application/json', async () => {
    mockGenerateId.mockImplementation(() => 'd4f951f4cbfc40d6b8b46fdfcb74dd87'); 
    const ispb = '32074986';
    const interactionId = 'd4f951f4cbfc40d6b8b46fdfcb74dd87';
    const endToEndId = 'a4e2708a5e004ec49b954b435636fbbc'

    const mockMessages: PixMessage[] = [
      {
        endToEndId: endToEndId,
        valor: 150.50,
        pagador: {
          nome: 'Pagador 1',
          cpfCnpj: '12345678901',
          ispb: '61740253',
          agencia: '0001',
          contaTransacional: '00012345',
          tipoConta: 'CACC',
        },
        recebedor: {
          nome: 'Recebedor 1',
          cpfCnpj: '10987654321',
          ispb: '32074986',
          agencia: '0002',
          contaTransacional: '54321000',
          tipoConta: 'SVGS',
        },
        campoLivre: '',
        txId: '',
        dataHoraPagamento: '2024-09-02T01:48:27.447Z',
      },
    ];

    // Mocks
    mockCheckStreamLimit.mockResolvedValue(true);
    mockRegisterStream.mockResolvedValue(undefined);
    mockGetPixMessages.mockResolvedValue(mockMessages);
    mockLogInteraction.mockResolvedValue(undefined);
    mockFormatMessage.mockImplementation(msg => msg);

    const expectedLimit = 1;

    const response = await request(app)
      .get(`/api/pix/${ispb}/stream/start`)
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    // Verificações
    expect(response.body).toEqual(mockMessages[0]);
    expect(response.headers['pull-next']).toBe(`/api/pix/${ispb}/stream/${interactionId}`);
    expect(mockCheckStreamLimit).toHaveBeenCalledWith(ispb);
    expect(mockRegisterStream).toHaveBeenCalledWith(ispb, expect.any(String));
    expect(mockGetPixMessages).toHaveBeenCalledWith(ispb, expectedLimit, expect.any(String));
    expect(mockLogInteraction).toHaveBeenCalledWith(expect.any(String), ispb, [mockMessages[0].endToEndId]);
  });
});

describe('getMessages with multipart/json', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and multiple messages with a Pull-Next header for pagination with multipart/json', async () => {
    const ispb = '32074986';
    const interactionId = 'd4f951f4cbfc40d6b8b46fdfcb74dd87';

    // Mocked messages
    const mockMessages: PixMessage[] = [
      {
        endToEndId: 'a4e2708a5e004ec49b954b435636fbbc',
        valor: 150.50,
        pagador: {
          nome: 'Pagador 1',
          cpfCnpj: '12345678901',
          ispb: '61740253',
          agencia: '0001',
          contaTransacional: '00012345',
          tipoConta: 'CACC',
        },
        recebedor: {
          nome: 'Recebedor 1',
          cpfCnpj: '10987654321',
          ispb: '32074986',
          agencia: '0002',
          contaTransacional: '54321000',
          tipoConta: 'SVGS',
        },
        campoLivre: '',
        txId: 'tx-id-1',
        dataHoraPagamento: '2024-09-02T01:48:27.447Z',
      },
      {
        endToEndId: 'b5e3709b6e115fd69c965b546738efde',
        valor: 200.75,
        pagador: {
          nome: 'Pagador 2',
          cpfCnpj: '98765432100',
          ispb: '61740254',
          agencia: '0002',
          contaTransacional: '00054321',
          tipoConta: 'SVGS',
        },
        recebedor: {
          nome: 'Recebedor 2',
          cpfCnpj: '21234567890',
          ispb: '32074987',
          agencia: '0003',
          contaTransacional: '54321001',
          tipoConta: 'CACC',
        },
        campoLivre: '',
        txId: 'tx-id-2',
        dataHoraPagamento: '2024-09-02T02:00:00.000Z',
      },
      {
        endToEndId: 'c6e480ac7e226gf7a1d076b657a8a7b8',
        valor: 50.25,
        pagador: {
          nome: 'Pagador 3',
          cpfCnpj: '12345678902',
          ispb: '61740255',
          agencia: '0003',
          contaTransacional: '00067890',
          tipoConta: 'CACC',
        },
        recebedor: {
          nome: 'Recebedor 3',
          cpfCnpj: '10987654322',
          ispb: '32074988',
          agencia: '0004',
          contaTransacional: '54321002',
          tipoConta: 'SVGS',
        },
        campoLivre: '',
        txId: 'tx-id-3',
        dataHoraPagamento: '2024-09-02T02:30:00.000Z',
      },
    ];

    // Mocks
    mockGenerateId.mockImplementation(() => interactionId);
    mockCheckStreamLimit.mockResolvedValue(true);
    mockRegisterStream.mockResolvedValue(undefined);
    mockGetPixMessages.mockResolvedValue(mockMessages);
    mockLogInteraction.mockResolvedValue(undefined);
    mockFormatMessage.mockImplementation(msg => msg);

    const expectedLimit = 10;

    mockInsertPixMessages.mockResolvedValue(mockMessages);

    const response = await request(app)
      .get(`/api/pix/${ispb}/stream/start`)
      .set('Content-Type', 'multipart/json')
      .expect('Content-Type', /json/)
      .expect(200);

    // Verificações
    expect(response.body).toEqual(mockMessages);
    expect(response.headers['pull-next']).toBe(`/api/pix/${ispb}/stream/${interactionId}`);
    expect(mockCheckStreamLimit).toHaveBeenCalledWith(ispb);
    expect(mockRegisterStream).toHaveBeenCalledWith(ispb, expect.any(String));
    expect(mockGetPixMessages).toHaveBeenCalledWith(ispb, expectedLimit, interactionId);
    expect(mockLogInteraction).toHaveBeenCalledWith(expect.any(String), ispb, mockMessages.map(msg => msg.endToEndId));
  });
});
