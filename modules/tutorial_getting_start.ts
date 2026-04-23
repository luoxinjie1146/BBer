import { NS } from "@ns";
import root from "./root";

/**
 * 运行脚本进程的 pid。
 */
type PID = ReturnType<NS[ "exec" ]>;

/** */
/**
 * 在执行exec之前执行NUKE，确保获得目标主机的ROOT权限。
 * @param ns
 * @param args - 执行 ns.exec 的参数。
 * @returns - 调用 ns.exec 返回的 pid。
 */
async function exec ( ns: NS, ...args: Parameters<NS[ "exec" ]> ): Promise<PID>
{
  const [ _, hostname, ...rest ] = args;
  await root( ns, hostname );
  const pid = ns.exec( ...args );
  return pid;
}

/**
 * 遍历主机树，对每个主机节点调用op方法。
 * @remark 由于现在没有connect方法，无法使用。
 * @param ns 
 * @param op - 对每个主机节点进行的操作函数
 * @param this_host - 当前连接的主机名称
 */
function host_tree (
  ns: NS,
  op: ( ns: NS, hostname: string ) => void,
  this_host: string
) : void
{
  op(ns, this_host);

  for ( let hostname of ns.scan() )
  {
    if ( hostname != this_host )
    {
      host_tree( ns, op, hostname );
    }
  }
}

/**
 * 批量运行游戏最初的脚本
 * @param ns 
 * @param hostname 
 * @returns 
 */
async function run_early_hack_template ( ns: NS, hostname: string, killall: boolean ) : Promise<PID>
{
  const script = "early-hack-template.js";

  // 主机有其他作用，不在主机运行业务脚本
  if ( hostname == "home" )
  {
    return 0;
  }

  try
  {
    // 攻击端口
    {
      // 将最新的脚本拷贝到目标主机
      ns.scp( script, hostname );
      (ns.scp( "/modules/shareRam.js", hostname ))
    }

    await root( ns, hostname );

    if ( ns.hasRootAccess( hostname ) )
    {
      if ( killall )
      {
        const is_killall_success = ns.killall( hostname, true );
      }

      const free_ram = ( ns.getServerMaxRam( hostname ) - ns.getServerUsedRam( hostname ) );
      const script_ram = ns.getScriptRam( script );
      const thread_num = Math.floor( free_ram / script_ram );
      let pid = 0;
      if ( thread_num > 0 )
      {
        pid = await exec( ns, "early-hack-template.js", hostname, thread_num );
      }
      await exec( ns, "/modules/shareRam.js", hostname );
      
      return pid;
    }
  }
  catch ( err )
  {
    ns.print( "ERROR ", err );
  }

  return 0;
}

function read_servers_file (ns: NS): string[]
{
  return JSON.parse( ns.read( "servers.json" ) );
}

/** @param {NS} ns */
export async function main ( ns: NS ) : Promise<void>
{
  let killall = false

  if ( ns.args[ 0 ] === "--killall" )
  {
    killall = true;
  }

  let targets = read_servers_file( ns );
  
  try
  {
    let pid_list : Promise<PID>[] = []
    for ( let host of targets )
    {
      let pid = run_early_hack_template( ns, host, killall );
      pid_list.push( pid );
    }
    for ( let pid of pid_list )
    {
      await pid;
    }
  }
  catch ( err )
  {
    ns.print( "ERROR ", err );
  }
}