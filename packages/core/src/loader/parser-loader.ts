import { Atom } from '../abstract';
import { LoadState } from '../constant';
import { createParser } from '../parser';
import { buildObject } from '../utility';
import { SchemaReadyContext, PluginReadyContext } from '../editor';

export class ParserLoader extends Atom<SchemaReadyContext, PluginReadyContext> {
    override id = 'parserLoader';
    override loadAfter = LoadState.SchemaReady;
    override main() {
        const children = [...this.context.nodes, ...this.context.marks];
        const spec = buildObject(children, (child) => [child.id, child.parser]);
        const parser = createParser(this.context.schema, this.context.markdownIt, spec);
        this.updateContext({ parser });
    }
}
