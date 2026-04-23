import { NS } from "@ns";

type Digit = 0 | 1 | 2 | 3;
type Carry = 0 | 1;
//
class Num4
{
	arr: Digit[] = [];
	carry: Carry = 0;

	constructor (public length: number)
	{
		for ( let i = 0; i < length; ++i )
		{
			this.arr.push( 0 );
		}
	}
 
	increment (): void
	{
		let c: Carry = 1;

		[ c, this.arr[ 0 ] ] = this._sum( this.arr[ 0 ], c );
		
		for ( let i = 1; i < this.length; ++i )
		{
			[ c, this.arr[ i ] ] = this._sum( this.arr[ i ], c );
		}

		this.carry = ( ( this.carry + c ) % 2 ) as Carry;
	}

	private _sum ( left: Digit, right: Digit ): [ carry: Carry, result: Digit ]
	{
		let result = left + right;
		let carry: Carry = 0;
		if ( result >= 4 )
		{
			result -= 4;
			carry = 1;
		}
		return [ carry, result as Digit ];
	}
}

function expr ( str: string, index: Digit[] ): string
{
	const ops = [ "+", "-", "*", "" ];

	let expr = "";
	for ( let i = 0; i < index.length; ++i )
	{
		expr += str[ i ];
		expr += ops[ index[ i ] ];
	}
	expr += str[ str.length - 1 ];

	return expr;
}

export async function main ( ns: NS )
{
	const org = "72948823";
	const dst = 37;
	let result: string[] = [];

	for ( let index = new Num4( org.length - 1 ); index.carry == 0; index.increment() )
	{
		const e = expr( org, index.arr );
		const r = eval( e );
		if ( dst == r )
		{
			result.push( e );
		}
	}

	ns.tprint( result );
}