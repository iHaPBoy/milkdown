import type { Node as ProsemirrorNode } from 'prosemirror-model';
import re from 'remark';
import { createCtx, Meta } from '../context';
import { createParser, InnerParserSpecMap } from '../parser';
import { createTiming } from '../timing';
import { buildObject, MilkdownPlugin } from '../utility';
import { remarkPluginsCtx } from './remark-plugin-factory';
import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from './schema';

export type Parser = (text: string) => ProsemirrorNode | null;
export type RemarkParser = ReturnType<typeof re>;
export const parserCtx = createCtx<Parser>(() => null);
export const remarkCtx: Meta<RemarkParser> = createCtx<RemarkParser>(re());
export const ParserReady = createTiming('ParserReady');

export const parser: MilkdownPlugin = (pre) => {
    pre.inject(parserCtx).inject(remarkCtx, re());

    return async (ctx) => {
        await SchemaReady();
        const nodes = ctx.get(nodesCtx);
        const marks = ctx.get(marksCtx);
        const remark = ctx.get(remarkCtx);
        const schema = ctx.get(schemaCtx);
        const remarkPlugins = ctx.get(remarkPluginsCtx);

        const processor = remarkPlugins.reduce((acc, plug) => acc.use(plug), remark);

        const children = [
            ...nodes.map((node) => ({ ...node, is: 'node' })),
            ...marks.map((mark) => ({ ...mark, is: 'mark' })),
        ];
        const spec: InnerParserSpecMap = buildObject(children, (child) => [
            child.id,
            { ...child.parser, is: child.is, key: child.id },
        ]) as InnerParserSpecMap;

        ctx.set(parserCtx, createParser(schema, spec, processor));
        ParserReady.done();
    };
};