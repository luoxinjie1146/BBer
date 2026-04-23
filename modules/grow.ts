import { NS } from "@ns"

/** @param {NS} ns */
export async function main ( ns: NS )
{
	const host = ns.args[ 0 ];
	while ( true )
	{
		await ns.grow( host );
	}
}